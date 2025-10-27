import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

// --- MEVSİM HESAPLAMA YARDIMCI FONKSİYONU ---
const getSeason = (date) => {
  const month = date.getMonth(); // 0 (Ocak) - 11 (Aralık)
  if (month >= 2 && month <= 4) return 'İlkbahar'; // Mart, Nisan, Mayıs
  if (month >= 5 && month <= 7) return 'Yaz';     // Haziran, Temmuz, Ağustos
  if (month >= 8 && month <= 10) return 'Sonbahar';// Eylül, Ekim, Kasım
  return 'Kış'; // Aralık, Ocak, Şubat
};

// --- BÜYÜKLÜĞE GÖRE İKON OLUŞTURMA ---
const getIconForEarthquake = (magnitude, isNew) => {
  const size = 20 + magnitude * 4; 
  let color = '#FFC300'; 

  if (magnitude >= 3.0) {
    color = '#FF5733'; 
  }
  if (magnitude >= 4.5) {
    color = '#C70039'; 
  }

  const wrapperClassName = isNew ? 'new-quake-marker' : 'earthquake-marker-dynamic';

  return new L.DivIcon({
    html: `<div class="map-marker-icon" style="
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
    className: wrapperClassName, 
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// --- ANA HARİTA BİLEŞENİ ---
function EarthquakeMap() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 
  const seenEarthquakeIds = useRef(new Set());
  const [newQuakeIds, setNewQuakeIds] = useState(new Set());
  
  // Son güncelleme zamanını tutacak state
  const [lastUpdated, setLastUpdated] = useState(null);

  const centerOfTurkey = [39.92077, 32.85411];

  // Bildirim izni isteme
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  // Bildirim gösterme
  const showNotification = (quake) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationBody = `Büyüklük: ${quake.buyukluk_ml}\nDerinlik: ${quake.derinlik_km} km`;
      new Notification(`Yeni Deprem: ${quake.konum}`, {
        body: notificationBody,
        icon: 'https://cdn-icons-png.flaticon.com/512/564/564619.png'
      });
    }
  };

  // Veri çekme ve işleme
  useEffect(() => {
    requestNotificationPermission();

    const fetchData = async () => {
      try {
        setError(null); 
        const response = await axios.get('http://localhost:5000/api/earthquakes');
        const newEarthquakes = response.data;
        
        // Zaman damgasını güncelle
        const now = new Date();
        const formattedDate = now.toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const season = getSeason(now);
        setLastUpdated(`${formattedDate} - ${season}`);
        
        // İlk yüklemede tüm depremleri 'görülmüş' olarak işle
        if (seenEarthquakeIds.current.size === 0) {
          newEarthquakes.forEach(quake => {
            const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
            seenEarthquakeIds.current.add(quakeId);
          });
        } else {
          // Sonraki yüklemelerde 'yeni' depremleri bul
          const justOccurredQuakes = newEarthquakes.filter(quake => {
            const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
            return !seenEarthquakeIds.current.has(quakeId);
          });

          // Yeni deprem varsa
          if (justOccurredQuakes.length > 0) {
            const newIds = new Set();
            justOccurredQuakes.forEach(quake => {
              showNotification(quake);
              const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
              seenEarthquakeIds.current.add(quakeId);
              newIds.add(quakeId); // Animasyon için ID'yi ekle
            });
            setNewQuakeIds(newIds);
          }
        }
        setEarthquakes(newEarthquakes);
      } catch (err) {
        setError('Deprem verileri yüklenemedi. Backend sunucusunun çalıştığından emin olun.');
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); 
    
    return () => clearInterval(interval);

  }, []);

  // Parlama efektini (newQuakeIds) bir süre sonra temizleyen hook
  useEffect(() => {
    if (newQuakeIds.size > 0) {
      const timer = setTimeout(() => {
        setNewQuakeIds(new Set());
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, [newQuakeIds]);


  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>Veriler Yükleniyor...</div>;
  }

  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div>
      {/* Parlama animasyonu için stiller */}
      <style>
        {`
          @keyframes pulse-animation {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); /* Kırmızı parlama */
            }
            70% {
              transform: scale(1.5);
              box-shadow: 0 0 10px 25px rgba(239, 68, 68, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            }
          }

          .new-quake-marker .map-marker-icon {
            animation: pulse-animation 1.5s 1;
          }
        `}
      </style>

      {/* SON GÜNCELLEME PANELİ */}
      <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 999,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '5px 10px',
          borderRadius: '5px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {lastUpdated ? `Son Güncelleme: ${lastUpdated}` : 'Veriler yükleniyor...'}
      </div>

      <MapContainer center={centerOfTurkey} zoom={6} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {earthquakes.map((quake) => {
          const quakeId = `${quake.tarih}-${quake.saat}-${quake.konum}`;
          const isNew = newQuakeIds.has(quakeId);

          return (
            <Marker 
              key={quakeId} 
              position={[quake.enlem, quake.boylam]}
              icon={getIconForEarthquake(quake.buyukluk_ml, isNew)} 
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
          );
        })}
      </MapContainer>
    </div>
  );
}

export default EarthquakeMap;

