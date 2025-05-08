import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Đọc file CSV
df = pd.read_csv("YOLOv8L_Training_Log.csv")

# Làm sạch tên cột
df.columns = [col.strip() for col in df.columns]

# Vẽ biểu đồ
plt.figure(figsize=(14, 8))
sns.lineplot(data=df, x='Epoch', y='mAP50', label='mAP50', linewidth=2)
sns.lineplot(data=df, x='Epoch', y='mAP50-95', label='mAP50-95', linewidth=2)
sns.lineplot(data=df, x='Epoch', y='Precision', label='Precision', linestyle='--')
sns.lineplot(data=df, x='Epoch', y='Recall', label='Recall', linestyle='--')

plt.title('Biểu đồ các chỉ số mAP, Precision, Recall theo Epoch (YOLOv8-Large)')
plt.xlabel('Epoch')
plt.ylabel('Giá trị')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
