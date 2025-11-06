EarthQuakeAI - Deprem Tahmin ve Görselleştirme Sistemi


Bu proje, Türkiye'deki deprem verilerini anlık olarak görselleştiren ve makine öğrenmesi kullanarak deprem büyüklüklerini tahmin eden bir full-stack web uygulamasıdır.

<img width="1919" height="885" alt="image" src="https://github.com/user-attachments/assets/e12d624b-4f46-4f4b-93b3-882c0216c0cc" />


🚀 Temel Özellikler

Uygulama, kullanıcıya zengin ve interaktif bir deneyim sunmak için aşağıdaki özellikleri içerir:

Canlı Veri Akışı: Kandilli Rasathanesi'nden alınan anlık deprem verilerinin 60 saniyede bir güncellenerek harita üzerinde gösterimi.

Dinamik İkonlar: Haritadaki deprem işaretçileri, depremin büyüklüğüne (ML) göre farklı renk (Sarı, Turuncu, Kırmızı) ve boyutlarda gösterilir.

Anlık Bildirimler: Yeni bir deprem meydana geldiğinde kullanıcıya masaüstü bildirimi gönderilir.

Parlama Efekti: Yeni tespit edilen depremler, harita üzerinde anlık bir "parlama" (pulse) animasyonu ile dikkat çeker.

Zaman Damgası: Verilerin en son ne zaman güncellendiğini, mevsim bilgisiyle birlikte gösteren bir panel.

ML Tahmin Paneli: Kullanıcının 6 farklı deprem özelliği (xM, Mb, ML, Enlem, vb.) girerek MD büyüklüğünü tahmin edebileceği açılır/kapanır bir panel.

Tahmin Geçmişi: Yapılan son 10 başarılı tahminin, tarihi ve sonucuyla birlikte listelenmesi.

💻 Kullanılan Teknolojiler ve Mimari

Proje, birbiriyle konuşan 3 ayrı sunucudan oluşan bir full-stack (microservice) mimarisine sahiptir:

1. Frontend (İstemci)

React: Kullanıcı arayüzünü oluşturmak için kullanıldı.

React-Leaflet: İnteraktif harita görselleştirmesi için kullanıldı.

Axios: Backend ve ML API'lerine istek atmak için kullanıldı.

2. Backend (Canlı Veri API - Port 5000)

Node.js & Express: Verileri sunmak için API sunucusu oluşturuldu.

Cheerio & Axios: Kandilli Rasathanesi'nin web sitesinden anlık verileri kazımak (web scraping) için kullanıldı.

3. Makine Öğrenmesi (Tahmin API - Port 5001)

Python & Flask: Eğitilmiş makine öğrenmesi modelini bir API olarak sunmak için kullanıldı.

LightGBM: Deprem büyüklüğünü (MD) %93 R² skoru ile tahmin eden ana model.

Pandas & Scikit-learn: Veri işleme ve model eğitimi için kullanıldı.

Joblib: Eğitilmiş .pkl model dosyasını yüklemek için kullanıldı.

⚙️ Projeyi Yerel Olarak Çalıştırma

Bu projeyi kendi bilgisayarınızda çalıştırmak için 3 ayrı terminal penceresine ihtiyacınız vardır.

1. Terminal: Backend'i Başlat (Canlı Veri API)

# 1. Backend klasörüne gidin
cd earthquake-backend

# 2. Gerekli paketleri yükleyin
npm install

# 3. Sunucuyu başlatın
node server.js


(Terminalde "Backend sunucusu http://localhost:5000 adresinde çalışıyor..." mesajını görmelisiniz.)

2. Terminal: ML API'yi Başlat (Tahmin Sunucusu)

# 1. ML klasörüne gidin
cd ml-model

# 2. (Eğer yoksa) Sanal ortamı kurun ve aktive edin
python -m venv venv
.\venv\Scripts\activate
# (macOS/Linux için: source venv/bin/activate)

# 3. Gerekli Python kütüphanelerini yükleyin
# (İpucu: 'pip freeze > requirements.txt' ile kendi dosyanızı oluşturabilirsiniz)
pip install Flask flask-cors pandas joblib scikit-learn lightgbm

# 4. API sunucusunu başlatın
python api.py


(Terminalde "Model 'deprem_modeli.pkl' başarıyla yüklendi." ve "Running on http://127.0.0.1:5001" mesajlarını görmelisiniz.)

3. Terminal: Frontend'i Başlat (React Arayüzü)

# 1. Frontend klasörüne gidin
cd earthquake-frontend

# 2. Gerekli paketleri yükleyin
npm install

# 3. React uygulamasını başlatın
npm start


(Bu komut, tarayıcınızda otomatik olarak http://localhost:3000 adresini açacaktır.)

