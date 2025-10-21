import pandas as pd
from sklearn.model_selection import train_test_split
# RandomForestRegressor yerine LightGBM'i import ediyoruz
import lightgbm as lgb 
from sklearn.metrics import mean_squared_error
import joblib # Modeli kaydetmek için

# 1. Veri Yükleme
try:
    data = pd.read_csv('veriler.csv', encoding='utf-8') 
except Exception as e:
    print(f"Dosya okuma hatası: {e}")
    print("Farklı bir encoding deniyorum: 'iso-8859-9'")
    try:
        data = pd.read_csv('veriler.csv', encoding='iso-8859-9')
    except Exception as e2:
        print(f"Tekrar hata: {e2}. Lütfen CSV dosyasını kontrol edin.")
        exit()


print("Veri başarıyla yüklendi. İlk 5 satır:")
print(data.head())

# 2. Veri Hazırlama
FEATURE_COLUMNS = ['xM', 'Mb', 'ML', 'Enlem', 'Boylam', 'Der(km)'] 
TARGET_COLUMN = 'MD'

# Gerekli sütunların olup olmadığını kontrol et
required_cols = FEATURE_COLUMNS + [TARGET_COLUMN]
if not all(col in data.columns for col in required_cols):
    print(f"Hata: Gerekli sütunlar bulunamadı.")
    print(f"Beklenen sütunlar: {required_cols}")
    print(f"Dosyadaki sütunlar: {list(data.columns)}")
    exit()

# Sayısal olmayan veya eksik verileri temizle
data = data.dropna(subset=required_cols) 
for col in required_cols:
    # Önceki adımdaki olası ondalık virgül sorununu da ekledim
    data[col] = data[col].astype(str).str.replace(',', '.', regex=False)
    data[col] = pd.to_numeric(data[col], errors='coerce') 
data = data.dropna(subset=required_cols) 


X = data[FEATURE_COLUMNS] 
y = data[TARGET_COLUMN]   

if X.empty or y.empty:
    print("Temizleme sonrası veri kalmadı. Lütfen CSV dosyasını kontrol edin.")
    exit()

# 3. Eğitim ve Test Verisi Ayırma
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Eğitim verisi: {len(X_train)} örnek")
print(f"Test verisi: {len(X_test)} örnek")

# 4. Model Seçimi ve Eğitim
# ---- DEĞİŞİKLİK BURADA ----
# RandomForestRegressor yerine LGBMRegressor modelini kullanalım
# n_estimators=100 parametresi aynı kaldı, karşılaştırma yapabilirsiniz.
model = lgb.LGBMRegressor(n_estimators=100, random_state=42)
# ---------------------------

print("Model eğitiliyor...")
# LightGBM de scikit-learn API'ını kullandığı için .fit() metodu aynıdır.
model.fit(X_train, y_train)
print("Model eğitildi.")

# 5. Model Değerlendirme
# .predict() ve .score() metodları da aynı şekilde çalışır.
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
print(f"Modelin Ortalama Karesel Hatası (MSE): {mse}")
print(f"Modelin R^2 Skoru: {model.score(X_test, y_test)}")

# 6. Modeli Kaydetme
# joblib, LightGBM modellerini de sorunsuz kaydeder.
model_filename = 'deprem_modeli.pkl'
joblib.dump(model, model_filename)

print(f"Model başarıyla '{model_filename}' olarak kaydedildi.")