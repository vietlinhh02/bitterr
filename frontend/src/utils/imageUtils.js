/**
 * Utility functions for image processing
 */

/**
 * Draw bounding boxes on an image
 * @param {string} imageUrl - URL of the image
 * @param {Array} detectedObjects - Array of objects with name and box_2d properties
 * @returns {Promise<string>} - Data URL of the image with bounding boxes
 */
export const drawBoundingBoxes = (imageUrl, detectedObjects) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Vẽ ảnh gốc
      ctx.drawImage(img, 0, 0);
      
      // Các màu cho bounding box
      const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
        '#33FFF1', '#F1FF33', '#FF8333', '#33FF83', '#8333FF'
      ];
      
      // Vẽ bounding boxes
      detectedObjects.forEach((object, index) => {
        if (object.box_2d) {
          const [x1, y1, x2, y2] = object.box_2d;
          const colorIndex = index % colors.length;
          
          // Kiểm tra tính hợp lệ của tọa độ bounding box
          if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) ||
              x1 < 0 || y1 < 0 || x2 > img.width || y2 > img.height ||
              x1 >= x2 || y1 >= y2) {
            console.warn('Tọa độ bounding box không hợp lệ:', object.box_2d);
            return; // Bỏ qua bounding box không hợp lệ
          }
          
          // Đảm bảo tọa độ nằm trong canvas
          const safeX1 = Math.max(0, Math.min(x1, img.width - 1));
          const safeY1 = Math.max(0, Math.min(y1, img.height - 1));
          const safeX2 = Math.max(safeX1 + 1, Math.min(x2, img.width));
          const safeY2 = Math.max(safeY1 + 1, Math.min(y2, img.height));
          
          // Vẽ rectangle với góc bo tròn
          ctx.strokeStyle = colors[colorIndex];
          ctx.lineWidth = 3;
          
          // Tính toán bán kính bo góc phù hợp
          const boxWidth = safeX2 - safeX1;
          const boxHeight = safeY2 - safeY1;
          const radius = Math.min(12, boxWidth / 4, boxHeight / 4); // Giới hạn bán kính phù hợp với kích thước box
          
          // Vẽ rectangle bo tròn
          ctx.beginPath();
          
          // Kiểm tra nếu kích thước quá nhỏ thì vẽ không bo góc
          if (boxWidth < 24 || boxHeight < 24) {
            ctx.rect(safeX1, safeY1, boxWidth, boxHeight);
          } else {
            // Vẽ bo góc cho box đủ lớn
            ctx.moveTo(safeX1 + radius, safeY1);
            ctx.lineTo(safeX2 - radius, safeY1);
            ctx.arcTo(safeX2, safeY1, safeX2, safeY1 + radius, radius);
            ctx.lineTo(safeX2, safeY2 - radius);
            ctx.arcTo(safeX2, safeY2, safeX2 - radius, safeY2, radius);
            ctx.lineTo(safeX1 + radius, safeY2);
            ctx.arcTo(safeX1, safeY2, safeX1, safeY2 - radius, radius);
            ctx.lineTo(safeX1, safeY1 + radius);
            ctx.arcTo(safeX1, safeY1, safeX1 + radius, safeY1, radius);
          }
          
          ctx.stroke();
          
          // Vẽ background cho text với góc bo tròn
          const objectName = object.name || object.drugName || 'Thuốc';
          ctx.fillStyle = colors[colorIndex] + 'DD'; // Thêm độ trong suốt
          
          // Đo kích thước text
          ctx.font = 'bold 16px Roboto, Arial, sans-serif';
          const textWidth = ctx.measureText(objectName).width;
          const textBgWidth = textWidth + 20; // Tăng width của nền text
          const textBgHeight = 32; // Tăng height của nền text
          
          // Điều chỉnh vị trí text để không bị tràn ra khỏi ảnh
          let textY = safeY1 - 35; // Mặc định đặt phía trên box
          if (textY < 15) { // Nếu quá gần cạnh trên
            textY = safeY1 + 15; // Đặt bên trong box
          }
          
          let textX = safeX1;
          if (textX + textBgWidth > img.width) {
            textX = img.width - textBgWidth - 5;
          }
          
          // Vẽ background text bo tròn
          ctx.beginPath();
          const textRadius = 10; // Tăng bán kính bo góc cho text
          ctx.moveTo(textX + textRadius, textY);
          ctx.lineTo(textX + textBgWidth - textRadius, textY);
          ctx.arcTo(textX + textBgWidth, textY, textX + textBgWidth, textY + textRadius, textRadius);
          ctx.lineTo(textX + textBgWidth, textY + textBgHeight - textRadius);
          ctx.arcTo(textX + textBgWidth, textY + textBgHeight, textX + textBgWidth - textRadius, textY + textBgHeight, textRadius);
          ctx.lineTo(textX + textRadius, textY + textBgHeight);
          ctx.arcTo(textX, textY + textBgHeight, textX, textY + textBgHeight - textRadius, textRadius);
          ctx.lineTo(textX, textY + textRadius);
          ctx.arcTo(textX, textY, textX + textRadius, textY, textRadius);
          ctx.fill();
          
          // Thêm hiệu ứng đổ bóng đẹp hơn
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Vẽ text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(objectName, textX + 10, textY + 22);
          
          // Reset hiệu ứng đổ bóng
          ctx.shadowColor = 'rgba(0, 0, 0, 0)';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      });
      
      // Cập nhật preview với ảnh đã vẽ bounding box
      resolve(canvas.toDataURL());
    };
    
    img.src = imageUrl;
  });
};

/**
 * Resize an image to specific dimensions
 * @param {File} file - The image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<Blob>} - Resized image blob
 */
export const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 