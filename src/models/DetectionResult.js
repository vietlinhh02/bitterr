const mongoose = require('mongoose');

const DetectionResultSchema = new mongoose.Schema({
  // Liên kết với người dùng đã tải lên hình ảnh
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Liên kết với thuốc trong database (nếu có)
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: false
  },
  
  // Thông tin hình ảnh gốc
  originalImage: {
    url: { type: String },
    filename: { type: String }
  },
  
  // Kết quả phân tích từ Gemini
  detectionResult: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Phân loại độ tin cậy của kết quả
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  // Danh sách thuốc được nhận diện
  detectedMedicines: [{
    name: { type: String },
    dosage: { type: String },
    active_ingredients: [{ type: String }],
    usage: { type: String },
    box_2d: [{ type: Number }], // [x1, y1, x2, y2]
    confidence: { type: Number, min: 0, max: 1 }
  }],
  
  // Truy vấn tìm kiếm (nếu đã sử dụng tính năng tìm kiếm)
  searchQuery: {
    type: String
  },
  
  // Đánh dấu kết quả đã được xác minh hay chưa
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Người xác minh kết quả (nếu có)
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Thời gian tạo và cập nhật
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Tự động cập nhật thời gian khi document được cập nhật
DetectionResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index để tối ưu tìm kiếm
DetectionResultSchema.index({ userId: 1, createdAt: -1 });
DetectionResultSchema.index({ medicineId: 1 });

const DetectionResult = mongoose.model('DetectionResult', DetectionResultSchema);

module.exports = DetectionResult; 