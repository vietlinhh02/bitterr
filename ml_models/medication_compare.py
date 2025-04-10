import pandas as pd
import os
import json
from collections import defaultdict

class MedicationComparer:
    def __init__(self, csv_path=None, class_map_path=None):
        # Mặc định là đường dẫn tương đối
        self.csv_path = csv_path or os.path.join(os.path.dirname(__file__), 'pres_df.csv')
        self.class_map_path = class_map_path or os.path.join(os.path.dirname(__file__), 'class_to_idx_swin_b.json')
        
        self.med_data = None
        self.id_to_name = {}
        self.name_to_ids = defaultdict(list)
        self.class_map = None
        self.reversed_class_map = None
        
        # Tải dữ liệu
        self._load_data()
        self._load_class_map()
        self._create_mappings()
    
    def _load_data(self):
        """Tải dữ liệu từ CSV"""
        if not os.path.exists(self.csv_path):
            print(f"Lỗi: Không tìm thấy file {self.csv_path}")
            return False
        
        try:
            self.med_data = pd.read_csv(self.csv_path)
            print(f"Đã tải dữ liệu từ {self.csv_path}, {len(self.med_data)} dòng")
            return True
        except Exception as e:
            print(f"Lỗi khi tải CSV: {e}")
            return False
    
    def _load_class_map(self):
        """Tải class map từ file JSON"""
        if not os.path.exists(self.class_map_path):
            print(f"Lỗi: Không tìm thấy file {self.class_map_path}")
            return False
        
        try:
            with open(self.class_map_path, 'r') as f:
                self.class_map = json.load(f)
                # Tạo map ngược từ index sang class ID
                self.reversed_class_map = {v: k for k, v in self.class_map.items()}
            print(f"Đã tải class map, {len(self.class_map)} lớp")
            return True
        except Exception as e:
            print(f"Lỗi khi tải class map: {e}")
            return False
    
    def _create_mappings(self):
        """Tạo các mapping giữa ID và tên thuốc"""
        if self.med_data is None:
            return
        
        # Nhóm dữ liệu theo mapping (ID thuốc) và text (tên thuốc)
        for _, row in self.med_data.iterrows():
            med_id = row.get('mapping')
            med_name = row.get('text')
            
            if pd.notna(med_id) and pd.notna(med_name):
                med_id = int(med_id)
                # Lưu tên thuốc theo ID
                if med_id not in self.id_to_name or len(med_name) > len(self.id_to_name[med_id]):
                    self.id_to_name[med_id] = med_name
                
                # Lưu ID theo tên thuốc
                if med_id not in self.name_to_ids[med_name]:
                    self.name_to_ids[med_name].append(med_id)
        
        print(f"Đã tạo mapping cho {len(self.id_to_name)} ID thuốc")
    
    def get_med_by_id(self, med_id):
        """Lấy thông tin thuốc theo ID"""
        if not isinstance(med_id, int):
            try:
                med_id = int(med_id)
            except:
                return None
        
        return {
            'id': med_id,
            'name': self.id_to_name.get(med_id, "Không tìm thấy")
        }
    
    def get_med_by_name(self, med_name):
        """Lấy thông tin thuốc theo tên"""
        ids = self.name_to_ids.get(med_name, [])
        return [self.get_med_by_id(med_id) for med_id in ids]
    
    def get_med_by_class_idx(self, class_idx):
        """Lấy thông tin thuốc theo class index trong model"""
        if not isinstance(class_idx, int):
            try:
                class_idx = int(class_idx)
            except:
                return None
        
        # Lấy class ID từ index
        class_id = self.reversed_class_map.get(str(class_idx))
        if class_id is None:
            return None
        
        # Lấy thông tin thuốc từ class ID
        return self.get_med_by_id(int(class_id))
    
    def compare_meds(self, id_list=None):
        """So sánh và hiển thị thông tin nhiều loại thuốc theo ID"""
        if id_list is None:
            # Nếu không có danh sách ID, hiển thị tất cả
            id_list = sorted(list(self.id_to_name.keys()))
        
        result = []
        for med_id in id_list:
            med_info = self.get_med_by_id(med_id)
            if med_info:
                result.append(med_info)
        
        return result
    
    def search_med_by_name(self, keyword):
        """Tìm kiếm thuốc theo từ khóa trong tên"""
        result = []
        keyword = keyword.lower()
        
        for med_name, ids in self.name_to_ids.items():
            if keyword in med_name.lower():
                for med_id in ids:
                    result.append({
                        'id': med_id,
                        'name': med_name
                    })
        
        return result
    
    def get_all_medications(self, limit=None, offset=0):
        """Lấy danh sách tất cả thuốc với phân trang"""
        all_ids = sorted(list(self.id_to_name.keys()))
        
        if offset >= len(all_ids):
            return []
        
        end_idx = None if limit is None else offset + limit
        selected_ids = all_ids[offset:end_idx]
        
        return self.compare_meds(selected_ids)
    
    def get_medication_count(self):
        """Lấy tổng số thuốc"""
        return len(self.id_to_name)

# Singleton instance
_med_comparer = None

def get_med_comparer():
    """Trả về instance singleton của MedicationComparer"""
    global _med_comparer
    if _med_comparer is None:
        _med_comparer = MedicationComparer()
    return _med_comparer 