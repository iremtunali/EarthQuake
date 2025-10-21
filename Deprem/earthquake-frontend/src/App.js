import React, { useState } from 'react';
import axios from 'axios';
import EarthquakeMap from './components/EarthquakeMap';

// Stil (CSS) dosyanıza ekleyebilirsiniz veya burada 'style' olarak kullanabilirsiniz
const predictionFormStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'white',
  padding: '15px',
  borderRadius: '8px',
  zIndex: 1000, // Haritanın üstünde kalması için
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  fontFamily: 'Arial, sans-serif'
};

const inputStyle = {
  display: 'block',
  margin: '10px 0',
  padding: '8px',
  width: '200px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

function App() {
  // Modelinizin beklediği tüm özellikler için state'ler
  const [formState, setFormState] = useState({
    xM: '',
    Mb: '',
    ML: '',
    Enlem: '',
    Boylam: '',
    'Der(km)': ''
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Formdaki herhangi bir input değiştiğinde state'i güncelleyen fonksiyon
  const handleInputChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const handlePrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictionResult(null);

    try {
      // Formdaki tüm verileri ML API'sine gönderiyoruz
      const response = await axios.post('http://localhost:5001/predict', formState);
      
      setPredictionResult(`Tahmini Büyüklük (MD): ${response.data.tahmin_edilen_buyukluk_MD.toFixed(2)}`);

    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error('Tahmin hatası:', errorMessage);
      setPredictionResult(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Harita bileşeni arka planda gösterilmeye devam ediyor */}
      <EarthquakeMap />

      {/* Haritanın üzerine eklediğimiz tahmin formu */}
      <div style={predictionFormStyle}>
        <h3>Deprem Büyüklüğü Tahmini (MD)</h3>
        <form onSubmit={handlePrediction}>
          {/* formState objesindeki her anahtar için bir input oluşturuyoruz */}
          {Object.keys(formState).map(key => (
            <input 
              key={key}
              name={key}
              type="number" 
              step="any"
              placeholder={`${key} (Örn: 3.5)`} 
              value={formState[key]}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Tahmin Ediliyor...' : 'Tahmin Et'}
          </button>
        </form>
        {predictionResult && (
          <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
            {predictionResult}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;

