const mongoose = require('mongoose');

const favoriteDrugSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    drugName: {
      type: String,
      required: true
    },
    genericName: {
      type: String,
      default: ''
    },
    brandName: {
      type: String,
      default: ''
    },
    drugInfo: {
      type: Object,
      required: true
    },
    source: {
      type: String,
      enum: ['fda'],
      default: 'fda'
    }
  },
  {
    timestamps: true
  }
);

// Tạo index để tối ưu tìm kiếm
favoriteDrugSchema.index({ userId: 1, drugName: 1 }, { unique: true });

const FavoriteDrug = mongoose.model('FavoriteDrug', favoriteDrugSchema);

module.exports = FavoriteDrug;