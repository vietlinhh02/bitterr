const QuestionSuggestion = require('../models/QuestionSuggestion');
const geminiService = require('../services/geminiService');

// Get static question suggestions from database
const getStaticSuggestions = async (req, res) => {
  try {
    const { drugType, brandName, genericName } = req.query;
    
    let query = {};
    
    if (drugType) {
      query.drugType = drugType;
    }
    
    if (brandName) {
      query.brandName = brandName;
    }
    
    if (genericName) {
      query.genericName = genericName;
    }
    
    if (Object.keys(query).length === 0) {
      query.isGeneral = true;
    }
    
    const suggestions = await QuestionSuggestion.find(query).limit(10);
    
    if (suggestions.length === 0) {
      const generalSuggestions = await QuestionSuggestion.find({ isGeneral: true }).limit(10);
      return res.status(200).json({ success: true, suggestions: generalSuggestions });
    }
    
    return res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error('Error fetching question suggestions:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Generate dynamic question suggestions using Gemini
const getDynamicSuggestions = async (req, res) => {
  try {
    const { drugInfo } = req.body;
    
    if (!drugInfo) {
      return res.status(400).json({ success: false, message: 'Drug information is required' });
    }
    
    // Get AI-generated questions based on drug info
    const dynamicQuestions = await geminiService.generateQuestionSuggestions(drugInfo);
    
    // Also get some static questions as a fallback
    let staticQuestions = [];
    try {
      const drugType = inferDrugType(drugInfo);
      const staticResults = await QuestionSuggestion.find({ 
        $or: [
          { isGeneral: true },
          { drugType: drugType }
        ]
      }).limit(5);
      
      staticQuestions = staticResults.map(item => item.question);
    } catch (err) {
      console.error('Error fetching static questions:', err);
    }
    
    // Combine both types of questions, prioritizing dynamic ones
    const combinedQuestions = [...dynamicQuestions];
    
    // Add static questions that aren't too similar to dynamic ones
    for (const question of staticQuestions) {
      if (!isQuestionSimilar(question, dynamicQuestions)) {
        combinedQuestions.push(question);
      }
      
      if (combinedQuestions.length >= 10) break;
    }
    
    return res.status(200).json({ 
      success: true, 
      suggestions: combinedQuestions
    });
  } catch (error) {
    console.error('Error generating dynamic question suggestions:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate question suggestions' });
  }
};

// Helper function to infer drug type from drug info
function inferDrugType(drugInfo) {
  const text = JSON.stringify(drugInfo).toLowerCase();
  
  if (text.includes('pain') || text.includes('ache') || text.includes('analgesic')) {
    return 'painkiller';
  } else if (text.includes('antibiotic') || text.includes('infection')) {
    return 'antibiotic';
  } else if (text.includes('allergy') || text.includes('antihistamine')) {
    return 'antiallergy';
  } else if (text.includes('blood pressure') || text.includes('hypertension')) {
    return 'bloodpressure';
  }
  
  return null;
}

// Helper function to check if a question is similar to any in a list
function isQuestionSimilar(question, questionList) {
  const q = question.toLowerCase();
  return questionList.some(existingQ => {
    const eq = existingQ.toLowerCase();
    return q.includes(eq.substring(0, 10)) || eq.includes(q.substring(0, 10));
  });
}

// Add a new static question suggestion (admin only)
const addStaticSuggestion = async (req, res) => {
  try {
    const { question, drugType, brandName, genericName, isGeneral } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }
    
    const newSuggestion = new QuestionSuggestion({
      question,
      drugType: drugType || null,
      brandName: brandName || null,
      genericName: genericName || null,
      isGeneral: isGeneral || false
    });
    
    await newSuggestion.save();
    
    return res.status(201).json({ success: true, suggestion: newSuggestion });
  } catch (error) {
    console.error('Error adding question suggestion:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { 
  getStaticSuggestions, 
  getDynamicSuggestions, 
  addStaticSuggestion 
};