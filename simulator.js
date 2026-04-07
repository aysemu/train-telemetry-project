const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const client = mqtt.connect('mqtt://localhost:1883');
const trainDataDir = path.join(__dirname, 'data', 'trains');

// --- 1. MANUEL CSV TRENLERİ (TREN-1 ve TREN-2) ---
function sendCsvTrainData(fileName, trainId) {
    const results = [];
    if (!fs.existsSync(fileName)) {
        console.warn(` Uyarı: ${fileName} dosyası bulunamadı, bu tren atlanıyor.`);
        return;
    }

    fs.createReadStream(fileName)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            let index = 0;
            setInterval(() => {
                if (index < results.length) {
                    const payload = {
                        trainId: trainId,
                        speed: Number(results[index].LOCO_SPEED) ,
                        lat: Number(results[index].gps_latitude),
                        lon: Number(results[index].gps_longitude),
                        temperature: (60 + Math.random() * 20),
                        timestamp: new Date()
                    };
                    client.publish(`tren/telemetri/${trainId}`, JSON.stringify(payload));
                    console.log(`🚀 [CSV] ${trainId} -> Hız: ${payload.speed}, Konum: ${payload.lat}, ${payload.lon}`);
                    index++;
                } else {
                    index = 0; // Başa dön
                }
            }, 1000);
        });
}

// --- 2. DİNAMİK JSON TRENLERİ  ---
function startJsonSimulation() {
    if (!fs.existsSync(trainDataDir)) return;
    
    const files = fs.readdirSync(trainDataDir).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
        const filePath = path.join(trainDataDir, file);
        const trainData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const trainId = path.basename(file, '.json');
        let index = 0;

        setInterval(() => {
            if (index < trainData.length) {
                const currentPoint = trainData[index];
                const payload = {
                    trainId: trainId,
                    speed: Number(currentPoint.speed) || 0,
                    lat: Number(currentPoint.latitude),
                    lon: Number(currentPoint.longitude),
                    temperature: (60 + Math.random() * 20),
                    timestamp: new Date()
                };
                client.publish(`tren/telemetri/${trainId}`, JSON.stringify(payload));
                // JSON loglarını terminali kirletmemesi için yoruma aldım çok kasıyo
                // console.log(` [JSON] ${trainId} gönderildi.`);
                index++;
            } else {
                index = 0;
            }
        }, 3000);
    });
}

client.on('connect', () => {
    console.log("✅ MQTT Bağlantısı Başarılı. Karma Simülasyon Başlıyor...");
    
    // Manuel CSV Trenleri ekledim diğerleri hep durağan
    sendCsvTrainData('test_data.csv', 'Tren-1');
    sendCsvTrainData('e5008_data.csv', 'Tren-2');

    // Dinamik JSON Trenleri
    startJsonSimulation();
});