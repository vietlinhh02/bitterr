const mongoose = require('mongoose');

const questionSuggestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  drugType: { type: String, default: null },
  brandName: { type: String, default: null },
  genericName: { type: String, default: null },
  isGeneral: { type: Boolean, default: false },
  tags: [{ type: String }], // Add tags array for better categorization
  popularity: { type: Number, default: 0 }, // Track how often a question is selected
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for faster searching
questionSuggestionSchema.index({ drugType: 1 });
questionSuggestionSchema.index({ brandName: 1 });
questionSuggestionSchema.index({ genericName: 1 });
questionSuggestionSchema.index({ isGeneral: 1 });
questionSuggestionSchema.index({ tags: 1 });
questionSuggestionSchema.index({ popularity: -1 });

const QuestionSuggestion = mongoose.model('QuestionSuggestion', questionSuggestionSchema);

module.exports = QuestionSuggestion;