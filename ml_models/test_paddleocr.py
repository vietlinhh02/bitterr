import os
import cv2
from paddleocr import PaddleOCR
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont

# Khởi tạo PaddleOCR với hỗ trợ tiếng Việt
print("Đang khởi tạo PaddleOCR...")
ocr = PaddleOCR(use_angle_cls=True, lang="vi", use_gpu=False)
print("Đã khởi tạo PaddleOCR thành công!")

def test_paddleocr(image_path):
    """
    Kiểm tra PaddleOCR trên một ảnh
    """
    if not os.path.exists(image_path):
        print(f"Không tìm thấy ảnh: {image_path}")
        return
    
    print(f"Đang xử lý ảnh: {image_path}")
    
    # Đọc ảnh
    image = cv2.imread(image_path)
    if image is None:
        print(f"Không mở được ảnh: {image_path}")
        return
    
    # Chuyển sang grayscale để cải thiện OCR
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Thực hiện OCR
    print("Đang thực hiện OCR...")
    result = ocr.ocr(gray, cls=True)
    
    if not result or not result[0]:
        print("Không phát hiện được văn bản trong ảnh.")
        return
    
    # Hiển thị kết quả
    print("\nKết quả OCR:")
    for idx, line in enumerate(result):
        print(f"Dòng {idx+1}:")
        for word in line:
            text = word[1][0]  # Văn bản
            confidence = word[1][1]  # Độ tin cậy
            print(f"  - Văn bản: {text}, Độ tin cậy: {confidence:.4f}")
    
    # Vẽ kết quả lên ảnh
    image_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(image_pil)
    
    # Cố gắng tải font hỗ trợ tiếng Việt
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    for line in result:
        for word in line:
            box = word[0]  # Tọa độ bounding box
            text = word[1][0]  # Văn bản
            
            # Vẽ bounding box
            points = [(int(box[0][0]), int(box[0][1])), 
                      (int(box[1][0]), int(box[1][1])), 
                      (int(box[2][0]), int(box[2][1])), 
                      (int(box[3][0]), int(box[3][1]))]
            draw.polygon(points, outline=(0, 255, 0), width=2)
            
            # Vẽ text
            draw.text((points[0][0], points[0][1] - 20), text, fill=(255, 0, 0), font=font)
    
    # Hiển thị ảnh với kết quả
    plt.figure(figsize=(10, 10))
    plt.imshow(image_pil)
    plt.title("Kết quả OCR")
    plt.axis("off")
    plt.show()

if __name__ == "__main__":
    # Thư mục uploads
    upload_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
    
    # Tạo thư mục nếu chưa tồn tại
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Kiểm tra xem có ảnh nào trong thư mục uploads không
    images = [f for f in os.listdir(upload_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if images:
        # Sử dụng ảnh đầu tiên trong thư mục
        test_paddleocr(os.path.join(upload_folder, images[0]))
    else:
        print(f"Không tìm thấy ảnh trong thư mục {upload_folder}")
        print("Vui lòng thêm ảnh vào thư mục uploads và chạy lại script này.") 