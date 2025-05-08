# -*- coding: utf-8 -*-
"""
SCRIPT HUẤN LUYỆN CÁC BỘ PHÂN LOẠI KHÁC (SVM, MLP, XGBoost)
TRÊN ĐẶC TRƯNG SWIN TRANSFORMER ĐÃ TRÍCH XUẤT (Phiên bản cho máy tính cục bộ)

1. Tải features (.npy) và labels (.npy) từ đường dẫn cục bộ.
2. Chia dữ liệu features/labels thành tập train và test.
3. Huấn luyện các bộ phân loại: SVM, MLP, XGBoost.
4. Đánh giá độ chính xác trên tập test.
5. Lưu lại model phân loại tốt nhất vào đường dẫn cục bộ.
"""

import os
import json # Để đọc file JSON chứa class_to_idx
import sys # Thêm sys để dùng sys.exit
import numpy as np
import time
import joblib # Để lưu model scikit-learn
import argparse
import logging
import traceback
import gc # Thêm gc
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import GradientBoostingClassifier # Có thể dùng thay XGBoost nếu chưa cài
# Hoặc dùng XGBoost/LightGBM nếu đã cài đặt:
try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False
    # logger cần được định nghĩa trước khi dùng ở đây
    # print("WARNING: XGBoost không được cài đặt. Sẽ bỏ qua huấn luyện XGBoost.") # Dùng print nếu logger chưa có

from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# --- Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cảnh báo XGBoost sau khi logger được định nghĩa
if not XGB_AVAILABLE:
    logger.warning("XGBoost không được cài đặt. Sẽ bỏ qua huấn luyện XGBoost.")

# --- Configuration & Paths (SỬA ĐƯỜNG DẪN MẶC ĐỊNH) ---
DEFAULT_MODEL_NAME = 'swin_b' # Phải khớp với tên model đã dùng tạo features

# Mặc định là file nằm cùng thư mục với script, hoặc bạn có thể chỉ định đường dẫn đầy đủ
# Sử dụng os.path.join để tương thích đa nền tảng tốt hơn
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Lấy thư mục chứa script này

DEFAULT_KNN_FEATURES_PATH = os.path.join(BASE_DIR, f"knn_features_{DEFAULT_MODEL_NAME}.npy")
DEFAULT_KNN_LABELS_PATH = os.path.join(BASE_DIR, f"knn_labels_{DEFAULT_MODEL_NAME}.npy")
DEFAULT_CLASS_MAP_PATH = os.path.join(BASE_DIR, f"class_to_idx_{DEFAULT_MODEL_NAME}.json") # Sửa đuôi file

# Đường dẫn lưu model phân loại tốt nhất (cũng lưu vào thư mục chứa script)
DEFAULT_BEST_CLASSIFIER_SAVE_PATH = os.path.join(BASE_DIR, f"best_classifier_{DEFAULT_MODEL_NAME}.joblib")
DEFAULT_BEST_CLASSIFIER_TYPE_PATH = os.path.join(BASE_DIR, f"best_classifier_{DEFAULT_MODEL_NAME}_type.txt")

# Tham số huấn luyện
DEFAULT_TEST_SIZE = 0.2
DEFAULT_RANDOM_STATE = 42

# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train and evaluate alternative classifiers on Swin features (Local Version).")
    # Các tham số giờ đây có default là đường dẫn tương đối/cùng thư mục
    parser.add_argument('--features-path', type=str, default=DEFAULT_KNN_FEATURES_PATH,
                        help=f"Path to the features file (.npy). Default: {DEFAULT_KNN_FEATURES_PATH}")
    parser.add_argument('--labels-path', type=str, default=DEFAULT_KNN_LABELS_PATH,
                        help=f"Path to the labels file (.npy). Default: {DEFAULT_KNN_LABELS_PATH}")
    parser.add_argument('--class-map-path', type=str, default=DEFAULT_CLASS_MAP_PATH,
                        help=f"Path to the class map file (.json). Default: {DEFAULT_CLASS_MAP_PATH}")
    parser.add_argument('--test-size', type=float, default=DEFAULT_TEST_SIZE)
    parser.add_argument('--random-state', type=int, default=DEFAULT_RANDOM_STATE)
    parser.add_argument('--save-path', type=str, default=DEFAULT_BEST_CLASSIFIER_SAVE_PATH,
                        help=f"Path to save the best trained classifier model. Default: {DEFAULT_BEST_CLASSIFIER_SAVE_PATH}")
    parser.add_argument('--save-type-path', type=str, default=DEFAULT_BEST_CLASSIFIER_TYPE_PATH,
                        help=f"Path to save the type ('svm', 'mlp', 'xgb') of the best classifier. Default: {DEFAULT_BEST_CLASSIFIER_TYPE_PATH}")
    parser.add_argument('--train-svm', action='store_true', help="Train Support Vector Machine.")
    parser.add_argument('--train-mlp', action='store_true', help="Train Multi-Layer Perceptron.")
    parser.add_argument('--train-xgb', action='store_true', help="Train XGBoost (if installed).")

    args = parser.parse_args()

    # Mặc định train cả 3 nếu không chọn
    if not args.train_svm and not args.train_mlp and not args.train_xgb:
        logger.info("No specific classifier selected, training SVM, MLP, and XGBoost (if available).")
        args.train_svm = True
        args.train_mlp = True
        args.train_xgb = XGB_AVAILABLE

    # --- Load Data ---
    logger.info("--- Loading Features and Labels ---")
    if not os.path.exists(args.features_path): logger.error(f"Features file not found: {args.features_path}"); sys.exit(1)
    if not os.path.exists(args.labels_path): logger.error(f"Labels file not found: {args.labels_path}"); sys.exit(1)
    if not os.path.exists(args.class_map_path): logger.error(f"Class map file not found: {args.class_map_path}"); sys.exit(1)

    try:
        features = np.load(args.features_path)
        labels = np.load(args.labels_path)
        with open(args.class_map_path, 'r') as f: class_to_idx = json.load(f)
        num_classes = len(class_to_idx)
        # Lấy danh sách tên lớp (là các string '0', '1', ...) để dùng trong classification_report
        # Sắp xếp theo index để đảm bảo thứ tự đúng
        class_names = [k for k, v in sorted(class_to_idx.items(), key=lambda item: item[1])]
        logger.info(f"Loaded {features.shape[0]} samples.")
        logger.info(f"Feature dimension: {features.shape[1]}")
        logger.info(f"Number of classes: {num_classes}")
        if features.shape[0] != labels.shape[0]: raise ValueError("Mismatch between features and labels count.")
    except Exception as e:
        logger.error(f"Failed to load data: {e}"); traceback.print_exc(); sys.exit(1)

    # --- Split Data ---
    logger.info(f"--- Splitting Data (Test size: {args.test_size}, Random state: {args.random_state}) ---")
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            features, labels,
            test_size=args.test_size,
            random_state=args.random_state,
            stratify=labels
        )
        logger.info(f"Train set size: {X_train.shape[0]}")
        logger.info(f"Test set size: {X_test.shape[0]}")
    except Exception as e:
        logger.error(f"Failed to split data: {e}"); traceback.print_exc(); sys.exit(1)

    del features, labels; gc.collect()

    # --- Train and Evaluate Classifiers ---
    classifiers = {}
    results = {}

    # 1. Support Vector Machine (SVM)
    if args.train_svm:
        logger.info("\n--- Training Support Vector Machine (SVM) ---")
        # Tham số SVM có thể cần tinh chỉnh thêm
        svm_classifier = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=args.random_state, verbose=True)
        start_time = time.time()
        try:
            svm_classifier.fit(X_train, y_train)
            train_time = time.time() - start_time
            logger.info(f"SVM training finished in {train_time:.2f} seconds.")
            logger.info("Evaluating SVM on test set...")
            y_pred_svm = svm_classifier.predict(X_test)
            accuracy_svm = accuracy_score(y_test, y_pred_svm)
            # Sử dụng class_names đã lấy từ class_map
            report_svm = classification_report(y_test, y_pred_svm, target_names=class_names, zero_division=0)
            logger.info(f"SVM Accuracy: {accuracy_svm:.4f}")
            print("SVM Classification Report:\n", report_svm)
            classifiers['svm'] = svm_classifier; results['svm'] = accuracy_svm
            # Vẽ Confusion Matrix
            cm_svm = confusion_matrix(y_test, y_pred_svm)
            plt.figure(figsize=(15, 12)); sns.heatmap(cm_svm, annot=False, fmt='d', cmap='Blues', xticklabels=False, yticklabels=False)
            plt.title('SVM Confusion Matrix'); plt.ylabel('True Label'); plt.xlabel('Predicted Label'); plt.tight_layout()
            plt.savefig(f"confusion_matrix_svm_{DEFAULT_MODEL_NAME}.png"); logger.info("Saved SVM confusion matrix plot."); plt.close()
        except Exception as e: logger.error(f"Error during SVM: {e}"); traceback.print_exc()

    # 2. Multi-Layer Perceptron (MLP)
    if args.train_mlp:
        logger.info("\n--- Training Multi-Layer Perceptron (MLP) ---")
        mlp_classifier = MLPClassifier(hidden_layer_sizes=(256, 128), activation='relu', solver='adam', alpha=0.0001,
                                     batch_size='auto', learning_rate='adaptive', learning_rate_init=0.001, max_iter=300,
                                     shuffle=True, random_state=args.random_state, tol=1e-4, verbose=True, warm_start=False,
                                     early_stopping=True, n_iter_no_change=10, validation_fraction=0.1)
        start_time = time.time()
        try:
            mlp_classifier.fit(X_train, y_train)
            train_time = time.time() - start_time
            logger.info(f"MLP training finished in {train_time:.2f} seconds.")
            logger.info(f"MLP converged after {mlp_classifier.n_iter_} iterations.")
            logger.info(f"Best MLP validation score: {mlp_classifier.best_validation_score_:.4f}")
            logger.info("Evaluating MLP on test set...")
            y_pred_mlp = mlp_classifier.predict(X_test)
            accuracy_mlp = accuracy_score(y_test, y_pred_mlp)
            report_mlp = classification_report(y_test, y_pred_mlp, target_names=class_names, zero_division=0)
            logger.info(f"MLP Accuracy: {accuracy_mlp:.4f}")
            print("MLP Classification Report:\n", report_mlp)
            classifiers['mlp'] = mlp_classifier; results['mlp'] = accuracy_mlp
            # Vẽ Confusion Matrix
            cm_mlp = confusion_matrix(y_test, y_pred_mlp)
            plt.figure(figsize=(15, 12)); sns.heatmap(cm_mlp, annot=False, fmt='d', cmap='Blues', xticklabels=False, yticklabels=False)
            plt.title('MLP Confusion Matrix'); plt.ylabel('True Label'); plt.xlabel('Predicted Label'); plt.tight_layout()
            plt.savefig(f"confusion_matrix_mlp_{DEFAULT_MODEL_NAME}.png"); logger.info("Saved MLP confusion matrix plot."); plt.close()
        except Exception as e: logger.error(f"Error during MLP: {e}"); traceback.print_exc()

    # 3. XGBoost Classifier
    if args.train_xgb and XGB_AVAILABLE:
        logger.info("\n--- Training XGBoost Classifier ---")
        xgb_classifier = xgb.XGBClassifier(objective='multi:softmax', num_class=num_classes, n_estimators=100,
                                         learning_rate=0.1, max_depth=5, subsample=0.8, colsample_bytree=0.8,
                                         use_label_encoder=False, eval_metric='mlogloss', random_state=args.random_state, n_jobs=-1)
        start_time = time.time()
        try:
            eval_set = [(X_test, y_test)]
            xgb_classifier.fit(X_train, y_train, early_stopping_rounds=10, eval_set=eval_set, verbose=False) # Giảm verbose
            train_time = time.time() - start_time
            logger.info(f"XGBoost training finished in {train_time:.2f} seconds.")
            logger.info("Evaluating XGBoost on test set...")
            y_pred_xgb = xgb_classifier.predict(X_test)
            accuracy_xgb = accuracy_score(y_test, y_pred_xgb)
            report_xgb = classification_report(y_test, y_pred_xgb, target_names=class_names, zero_division=0)
            logger.info(f"XGBoost Accuracy: {accuracy_xgb:.4f}")
            print("XGBoost Classification Report:\n", report_xgb)
            classifiers['xgb'] = xgb_classifier; results['xgb'] = accuracy_xgb
            # Vẽ Confusion Matrix
            cm_xgb = confusion_matrix(y_test, y_pred_xgb)
            plt.figure(figsize=(15, 12)); sns.heatmap(cm_xgb, annot=False, fmt='d', cmap='Blues', xticklabels=False, yticklabels=False)
            plt.title('XGBoost Confusion Matrix'); plt.ylabel('True Label'); plt.xlabel('Predicted Label'); plt.tight_layout()
            plt.savefig(f"confusion_matrix_xgb_{DEFAULT_MODEL_NAME}.png"); logger.info("Saved XGBoost confusion matrix plot."); plt.close()
        except Exception as e: logger.error(f"Error during XGBoost: {e}"); traceback.print_exc()
    elif args.train_xgb and not XGB_AVAILABLE: logger.warning("Skipping XGBoost training.")

    # --- Determine and Save Best Classifier ---
    if results:
        best_classifier_name = max(results, key=results.get)
        best_accuracy = results[best_classifier_name]
        best_classifier_model = classifiers[best_classifier_name]
        logger.info(f"\n--- Best Classifier: {best_classifier_name.upper()} (Accuracy: {best_accuracy:.4f}) ---")
        logger.info(f"Saving best classifier ({best_classifier_name}) model to: {args.save_path}")
        try:
            # Đảm bảo thư mục tồn tại trước khi lưu
            os.makedirs(os.path.dirname(args.save_path), exist_ok=True)
            joblib.dump(best_classifier_model, args.save_path)
            logger.info("Best classifier model saved successfully.")
            # Lưu tên loại model tốt nhất
            os.makedirs(os.path.dirname(args.save_type_path), exist_ok=True)
            with open(args.save_type_path, 'w') as ftype: ftype.write(best_classifier_name)
            logger.info(f"Best classifier type '{best_classifier_name}' saved to: {args.save_type_path}")
        except Exception as e: logger.error(f"Failed to save the best classifier model: {e}")
    else: logger.warning("No classifiers were trained/evaluated. No best model to save.")

    logger.info("--- Training and Evaluation Complete ---")