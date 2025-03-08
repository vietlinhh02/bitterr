const mongoose = require('mongoose');

const favoriteDrugSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drugName: { type: String, required: true },
  genericName: { type: String },
  brandName: { type: String },
  drugInfo: { type: Object, required: true }, // Lưu thông tin thuốc
  timestamp: { type: Date, default: Date.now },
});

// Tạo index cho tìm kiếm nhanh
favoriteDrugSchema.index({ userId: 1, drugName: 1 }, { unique: true });

const FavoriteDrug = mongoose.model('FavoriteDrug', favoriteDrugSchema);

module.exports = FavoriteDrug;