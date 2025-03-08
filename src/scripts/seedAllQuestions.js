require('dotenv').config();
const mongoose = require('mongoose');
const QuestionSuggestion = require('../models/QuestionSuggestion');
const connectDB = require('../config/db');

// Import all the seed data - fix the paths
const generalQuestions = require('./data/generalQuestions');
const drugTypeQuestions = require('./data/drugTypeQuestions');
const brandSpecificQuestions = require('./data/brandSpecificQuestions');
const specialPopulationQuestions = require('./data/specialPopulationQuestions');

const seedAllQuestions = async () => {
  try {
    await connectDB();
    
    // Clear existing question suggestions
    await QuestionSuggestion.deleteMany({});
    
    // Insert all questions into the database
    await QuestionSuggestion.insertMany([
      ...generalQuestions,
      ...drugTypeQuestions.painKillerQuestions,
      ...drugTypeQuestions.antibioticQuestions,
      ...drugTypeQuestions.bpMedicationQuestions,
      ...drugTypeQuestions.diabetesMedicationQuestions,
      ...drugTypeQuestions.allergyMedicationQuestions,
      ...brandSpecificQuestions,
      ...specialPopulationQuestions
    ]);
    
    console.log('All question suggestions seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding question suggestions:', error);
    process.exit(1);
  }
};

seedAllQuestions();