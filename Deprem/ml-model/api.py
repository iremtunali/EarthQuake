import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# 1. Flask uygulamasını başlat
app = Flask(__name__)
CORS(app) 

# 2. Eğitilmiş modeli yükle
MODEL_PATH = 'deprem_modeli.pkl'
try:
    model = joblib.load(MODEL_PATH)
    print(f"* Model '{MODEL_PATH}' başarıyla yüklendi.")
except Exception as e:
    print(f"Hata: Model yüklenemedi. {e}")
    model = None

# 3. /predict adında bir API endpoint'i (uç nokta) oluştur
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model yüklenemedi.'}), 500

    try:
        # 4. Gelen JSON verisini al
        data = request.get_json(force=True)
        
        # 'train_model.py' içinde kullandığınız sütun adlarıyla aynı olmalı!
        # ---- DEĞİŞİKLİK BURADA ----
        # Artık 6 özelliği de JSON'dan alıyoruz.
        xM = float(data['xM'])
        Mb = float(data['Mb'])
        ML = float(data['ML'])
        Enlem = float(data['Enlem'])
        Boylam = float(data['Boylam'])
        Der_km = float(data['Der(km)'])
        # ---------------------------

        # 5. Modelin beklediği formata (2D array) dönüştür
        # Sütun sırası train_model.py'deki ile BİREBİR AYNI olmalı
        features = [[xM, Mb, ML, Enlem, Boylam, Der_km]]
        
        # 6. Tahmini yap
        prediction = model.predict(features)
        
        # 7. Tahmini JSON olarak geri döndür
        return jsonify({
            'tahmin_edilen_buyukluk_MD': prediction[0]
        })

    except KeyError as e:
        return jsonify({'error': f'Eksik özellik: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Python script'i doğrudan çalıştırıldığında sunucuyu başlat
if __name__ == '__main__':
    app.run(port=5001, debug=True)

