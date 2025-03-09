import os
import requests
import json
from PIL import Image
import matplotlib.pyplot as plt

def test_api():
    """
    Kiểm tra API detect/upload
    """
    # Thư mục uploads
    upload_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
    
    # Kiểm tra xem có ảnh nào trong thư mục uploads không
    images = [f for f in os.listdir(upload_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not images:
        print(f"Không tìm thấy ảnh trong thư mục {upload_folder}")
        print("Vui lòng thêm ảnh vào thư mục uploads và chạy lại script này.")
        return
    
    # Sử dụng ảnh đầu tiên trong thư mục
    image_path = os.path.join(upload_folder, images[0])
    print(f"Đang sử dụng ảnh: {image_path}")
    
    # Hiển thị ảnh
    img = Image.open(image_path)
    plt.figure(figsize=(10, 10))
    plt.imshow(img)
    plt.title("Ảnh gốc")
    plt.axis("off")
    plt.show()
    
    # Gửi request đến API
    url = "http://localhost:5001/detect/upload"
    files = {"image": open(image_path, "rb")}
    
    print("Đang gửi request đến API...")
    try:
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("\nKết quả API:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            # Hiển thị kết quả lên ảnh
            if result.get("results"):
                draw = Image.open(image_path).convert("RGB")
                plt.figure(figsize=(10, 10))
                plt.imshow(draw)
                
                for item in result["results"]:
                    bbox = item["bbox"]
                    text = item.get("text", "")
                    verified_text = item.get("verified_text", "")
                    
                    # Vẽ bounding box
                    x_min, y_min, x_max, y_max = bbox
                    plt.plot([x_min, x_max, x_max, x_min, x_min], 
                             [y_min, y_min, y_max, y_max, y_min], 'g-', linewidth=2)
                    
                    # Hiển thị text
                    plt.text(x_min, y_min - 10, text, color='red', fontsize=12, 
                             bbox=dict(facecolor='white', alpha=0.7))
                
                plt.title("Kết quả detect và OCR")
                plt.axis("off")
                plt.show()
            else:
                print("Không phát hiện được văn bản trong ảnh.")
        else:
            print(f"Lỗi: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Lỗi khi gửi request: {e}")
    finally:
        files["image"].close()

if __name__ == "__main__":
    test_api() 