import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

// --- AŞAMA 1: BÜYÜKLÜĞE GÖRE GÖRSELLEŞTİRME ---
// Depremin büyüklüğüne göre farklı ikonlar oluşturan bir yardımcı fonksiyon.
// Bu, haritayı çok daha anlaşılır ve bilgilendirici hale getirir.
const getIconForEarthquake = (magnitude) => {
  const size = 20 + magnitude * 4; // Büyüklük arttıkça ikon boyutu da artar
  let color = '#FFC300'; // Sarı (Küçük deprem)

  if (magnitude >= 3.0) {
    color = '#FF5733'; // Turuncu (Orta deprem)
  }
  if (magnitude >= 4.5) {
    color = '#C70039'; // Kırmızı (Büyük deprem)
  }

  // HTML ve CSS ile dinamik bir ikon oluşturuyoruz
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.7);
      box-shadow: 0 0 10px ${color};
      text-align: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      line-height: ${size - 4}px;
    ">${magnitude.toFixed(1)}</div>`,
    className: 'earthquake-marker-dynamic',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

function EarthquakeMap() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // --- AŞAMA 2: YÜKLENİYOR DURUMU ---
  const seenEarthquakeIds = useRef(new Set());

  const centerOfTurkey = [39.92077, 32.85411];

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const showNotification = (quake) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationBody = `Büyüklük: ${quake.buyukluk_ml}\nDerinlik: ${quake.derinlik_km} km`;
      new Notification(`Yeni Deprem: ${quake.konum}`, {
        body: notificationBody,
        icon: 'https://cdn-icons-png.flaticon.com/512/564/564619.png'
      });
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    const fetchData = async () => {
      try {
        setError(null); // Her yeni istek öncesi eski hatayı temizle
        const response = await axios.get('http://localhost:5000/api/earthquakes');
        const newEarthquakes = response.data;
        
        if (seenEarthquakeIds.current.size === 0) {
          newEarthquakes.forEach(quake => {
            const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
            seenEarthquakeIds.current.add(quakeId);
          });
        } else {
          const justOccurredQuakes = newEarthquakes.filter(quake => {
            const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
            return !seenEarthquakeIds.current.has(quakeId);
          });

          if (justOccurredQuakes.length > 0) {
            justOccurredQuakes.forEach(quake => {
              showNotification(quake);
              const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
              seenEarthquakeIds.current.add(quakeId);
            });
          }
        }
        setEarthquakes(newEarthquakes);
      } catch (err) {
        setError('Deprem verileri yüklenemedi. Backend sunucusunun çalıştığından emin olun.');
        console.error(err);
      } finally {
        setLoading(false); // --- AŞAMA 2: Yükleme tamamlandı ---
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); 
    
    return () => clearInterval(interval);

  }, []);

  // --- AŞAMA 2: YÜKLENİYOR GÖSTERGESİ ---
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>Veriler Yükleniyor...</div>;
  }

  // --- AŞAMA 3: GELİŞTİRİLMİŞ HATA GÖSTERİMİ ---
  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <MapContainer center={centerOfTurkey} zoom={6} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {earthquakes.map((quake, idx) => (
        <Marker 
          key={idx} 
          position={[quake.enlem, quake.boylam]}
          icon={getIconForEarthquake(quake.buyukluk_ml)} // --- AŞAMA 1: DİNAMİK İKON KULLANIMI ---
        >
          <Popup>
            <div>
              <h3>{quake.konum}</h3>
              <p><strong>Büyüklük (ML):</strong> {quake.buyukluk_ml}</p>
              <p><strong>Tarih:</strong> {quake.tarih} {quake.saat}</p>
              <p><strong>Derinlik:</strong> {quake.derinlik_km} km</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default EarthquakeMap;

