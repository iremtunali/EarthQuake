const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 5000;

// React uygulamasından gelen isteklere izin ver
app.use(cors());

// Kandilli Rasathanesi'nin anlık deprem verilerini sunduğu URL
// Bu URL'in yapısı değişirse scraper'ın güncellenmesi gerekir.
const KANDILLI_URL = 'http://www.koeri.boun.edu.tr/scripts/lst0.asp';

/**
 * Kandilli'nin verisi düz metin formatındadır.
 * Bu fonksiyon, bu metni parse edip JSON formatına dönüştürür.
 * * Örnek Satır:
 * 2024.10.20 12:25:30  40.8253   29.0748        5.0      -.-  2.1  -.-   IZMIT KORFEZI (MARMARA DENIZI)
 */
function parseKandilliData(html) {
    const $ = cheerio.load(html);
    // Veriler <pre> etiketi içinde yer alıyor
    const dataLines = $('pre').text().split('\n');
    
    const earthquakes = [];
    
    // İlk 6 satır başlık bilgisi, onları atlıyoruz
    for (let i = 6; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (line.length === 0) continue;

        // Veriyi boşluklara göre ayır
        const parts = line.split(/\s+/);

        if (parts.length < 9) continue; // Geçersiz satır

        try {
            const earthquakeData = {
                tarih: parts[0],
                saat: parts[1],
                enlem: parseFloat(parts[2]),
                boylam: parseFloat(parts[3]),
                derinlik_km: parseFloat(parts[4]),
                buyukluk_md: parts[5] === '-.-' ? 0 : parseFloat(parts[5]),
                buyukluk_ml: parts[6] === '-.-' ? 0 : parseFloat(parts[6]),
                buyukluk_mw: parts[7] === '-.-' ? 0 : parseFloat(parts[7]),
                // Konum bilgisi birden fazla kelime olabilir, kalanını birleştir
                konum: parts.slice(8).join(' ').replace(/İlksel|REVIZE/g, '').trim()
            };
            
            // Sadece anlamlı büyüklükteki depremleri al (örn: 1.5 ve üzeri)
            if (earthquakeData.buyukluk_ml >= 1.5) {
                earthquakes.push(earthquakeData);
            }
        } catch (e) {
            console.error('Satır parse hatası:', line, e);
        }
    }
    return earthquakes;
}


// API Endpoint'i
app.get('/api/earthquakes', async (req, res) => {
    try {
        // Kandilli'den veriyi çek
        // 'iconv-lite' gibi bir kütüphane gerekebilir, çünkü sayfa ISO-8859-9 kodlaması kullanıyor.
        // Basitlik için şimdilik doğrudan axios ile deniyoruz.
        const response = await axios.get(KANDILLI_URL);
        
        const earthquakes = parseKandilliData(response.data);
        
        res.json(earthquakes);

    } catch (error) {
        console.error('Veri çekme hatası:', error.message);
        res.status(500).json({ message: 'Deprem verileri alınamadı.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor...`);
});