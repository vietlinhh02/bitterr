// drug-app/backend/src/models/DrugSearch.js
const mongoose = require('mongoose');

const drugSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  searchType: { type: String, enum: ['name', 'ingredients'], default: 'name' },
  resultCount: { type: Number, default: 0 },
  source: { type: String, enum: ['fda', 'longchau'], default: 'fda' }, // Nguồn tìm kiếm
  results: { type: Object, required: false }, // Lưu kết quả tìm kiếm (tùy chọn)
  timestamp: { type: Date, default: Date.now },
});

// Thêm index để tăng tốc độ truy vấn
drugSearchSchema.index({ userId: 1, timestamp: -1 });

const DrugSearch = mongoose.model('DrugSearch', drugSearchSchema);

module.exports = DrugSearch;