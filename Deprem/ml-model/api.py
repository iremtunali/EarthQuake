import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app) 


MODEL_PATH = 'deprem_modeli.pkl'
try:
    model = joblib.load(MODEL_PATH)
    print(f"* Model '{MODEL_PATH}' başarıyla yüklendi.")
except Exception as e:
    print(f"Hata: Model yüklenemedi. {e}")
    model = None


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model yüklenemedi.'}), 500

    try:
        
        data = request.get_json(force=True)
        
       
        xM = float(data['xM'])
        Mb = float(data['Mb'])
        ML = float(data['ML'])
        Enlem = float(data['Enlem'])
        Boylam = float(data['Boylam'])
        Der_km = float(data['Der(km)'])
        # ---------------------------

        
        features = [[xM, Mb, ML, Enlem, Boylam, Der_km]]
        
        
        prediction = model.predict(features)
        
        
        return jsonify({
            'tahmin_edilen_buyukluk_MD': prediction[0]
        })

    except KeyError as e:
        return jsonify({'error': f'Eksik özellik: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(port=5001, debug=True)

