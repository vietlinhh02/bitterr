from flask import Flask, request, jsonify
import detect_utils
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Khởi tạo YOLO model
yolo_model = detect_utils.YOLO("../runs/detect/yolo11n3/weights/best.pt")

# Cấu hình upload
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/detect/upload', methods=['POST'])
def detect_upload():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Thực hiện detect và OCR
            ocr_results = detect_utils.detect_and_ocr(filepath, yolo_model)
            
            # Xóa file sau khi xử lý
            os.remove(filepath)
            
            if not ocr_results:
                return jsonify({'message': 'No text detected in image', 'results': []}), 200
                
            return jsonify({
                'message': 'Detection successful',
                'results': [{
                    'bbox': [x_min, y_min, x_max, y_max],
                    'text': text
                } for x_min, y_min, x_max, y_max, text in ocr_results]
            }), 200
            
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
