import React, { useState } from 'react';
import axios from 'axios';
import EarthquakeMap from './components/EarthquakeMap';

// --- STIL TANIMLAMALARI ---

const openPanelButtonStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 20px',
  zIndex: 999, 
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  fontSize: '16px',
  fontWeight: 'bold',
};

const predictionFormStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'white',
  padding: '15px',
  borderRadius: '8px',
  zIndex: 1000,
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  fontFamily: 'Arial, sans-serif',
  width: '280px',
  paddingTop: '45px', 
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '15px',
  background: 'transparent',
  border: 'none',
  fontSize: '24px',
  color: '#888',
  cursor: 'pointer',
  padding: '0',
  lineHeight: '1',
};

const titleStyle = {
  marginTop: 0,
  position: 'absolute',
  top: '20px',
  left: '15px',
  marginRight: '30px', 
};

const inputStyle = {
  display: 'block',
  margin: '10px 0',
  padding: '8px',
  width: '93%',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  width: '100%', 
  padding: '10px', 
  background: '#007bff', 
  color: 'white', 
  border: 'none', 
  borderRadius: '4px', 
  cursor: 'pointer'
};

const historyContainerStyle = {
  marginTop: '20px',
  borderTop: '1px solid #eee',
  paddingTop: '10px',
  maxHeight: '250px',
  overflowY: 'auto',
};

const historyItemStyle = {
  background: '#f9f9f9',
  border: '1px solid #eee',
  borderRadius: '4px',
  padding: '8px',
  marginBottom: '8px',
  fontSize: '12px',
};

// YENİ: Tarih bilgisi için küçük ve gri bir stil
const historyDateStyle = {
  margin: '3px 0 0 0',
  color: '#777',
  fontSize: '11px',
};

// --- ANA UYGULAMA BİLEŞENİ ---
function App() {
  const initialFormState = {
    xM: '', Mb: '', ML: '', Enlem: '', Boylam: '', 'Der(km)': ''
  };

  const [formState, setFormState] = useState(initialFormState);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
      const response = await axios.post('http://localhost:5001/predict', formState);
      
      const result = response.data.tahmin_edilen_buyukluk_MD;
      const resultText = `Tahmini Büyüklük (MD): ${result.toFixed(2)}`;
      
      setPredictionResult(resultText); 

      // --- YENİ: Tahmin tarihini formatla ---
      const now = new Date();
      const formattedDate = now.toLocaleString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
      });

      const newPredictionEntry = {
        id: now.toISOString(), 
        inputs: { ...formState },      
        output: result.toFixed(2),
        date: formattedDate // YENİ EKLENDİ
      };
      // --- BİTTİ ---

      setPredictionHistory(prevHistory => {
        const updatedHistory = [newPredictionEntry, ...prevHistory];
        return updatedHistory.slice(0, 10); 
      });

      setFormState(initialFormState);

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

      {/* --- AÇILIR PANEL MANTIĞI --- */}
      {isPanelOpen ? (
        // Panel AÇIKSA: Formu göster
        <div style={predictionFormStyle}>
          {/* Kapatma Butonu */}
          <button onClick={() => setIsPanelOpen(false)} style={closeButtonStyle}>
            &times;
          </button>
          
          <h3 style={titleStyle}>Deprem Büyüklüğü Tahmini (MD)</h3>
          
          <form onSubmit={handlePrediction}>
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
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Tahmin Ediliyor...' : 'Tahmin Et'}
            </button>
          </form>
          
          {predictionResult && (
            <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
              {predictionResult}
            </p>
          )}

          {predictionHistory.length > 0 && (
            <div style={historyContainerStyle}>
              <h4 style={{ margin: '0 0 10px 0' }}>Geçmiş Tahminler</h4>
              {/* --- YENİ: Geçmiş listesi render edilirken tarih de eklendi --- */}
              {predictionHistory.map(entry => (
                <div key={entry.id} style={historyItemStyle}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    Sonuç: {entry.output} (MD)
                  </p>
                  {/* YENİ EKLENDİ */}
                  <p style={historyDateStyle}>
                    Tarih: {entry.date}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#555', wordBreak: 'break-word' }}>
                    Girdiler: (Enlem: {entry.inputs.Enlem}, Boylam: {entry.inputs.Boylam}, ...)
                  </p>
                </div>
              ))}
              {/* --- BİTTİ --- */}
            </div>
          )}
        </div>
      ) : (
        // Panel KAPALIYSA: Sadece paneli açma butonunu göster
        <button onClick={() => setIsPanelOpen(true)} style={openPanelButtonStyle}>
          Tahmin Yap
        </button>
      )}
      {/* --- BİTTİ: AÇILIR PANEL MANTIĞI --- */}
    </div>
  );
}

export default App;

