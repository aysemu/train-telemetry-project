const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const mqtt = require('mqtt'); 
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// 1. Önce uygulamayı (app) oluşturmalısın
const app = express(); 

// 2. Sonra app nesnesine özellikleri (middleware) eklemelisin
app.use(helmet()); 
app.use(cors());
app.use(express.json()); // JSON gövdelerini okuyabilmek için bu da şart

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use("/api/", limiter);

// 3. En son sunucuyu (server) bu app ile başlatmalısın
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- MONGODB BAĞLANTISI ---
mongoose.connect("mongodb://localhost:27017/tren_telemetri")
  .then(() => console.log(" MongoDB Bağlantısı Başarılı"))
  .catch(err => console.error(" Bağlantı Hatası:", err));

// --- VERİ ŞEMASI ---
const telemetrySchema = new mongoose.Schema({
  trainId: String,
  speed: Number,
  latitude: Number,
  longitude: Number,
  temperature: Number,
  timestamp: { type: Date, default: Date.now }
});
const Telemetry = mongoose.model("Telemetry", telemetrySchema);

// --- MQTT ABONELİĞİ (SUBSCRIBER) ---
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    mqttClient.subscribe('tren/telemetri/#'); 
    console.log("📡 Backend MQTT üzerinden trenleri dinliyor...");
});

mqttClient.on('message', async (topic, message) => {
    try {
        const rawData = JSON.parse(message.toString());
        
        const data = {
            trainId: rawData.trainId,
            speed: Number(rawData.speed),
            latitude: Number(rawData.lat),
            longitude: Number(rawData.lon),
            temperature: Number(rawData.temperature),
            timestamp: rawData.timestamp || new Date()
        };

        // 1. ADIM: Veritabanına kaydet ve işlemin bitmesini bekle (await)
        const newRecord = new Telemetry(data);
        const savedRecord = await newRecord.save(); 

        // 2. ADIM: Sadece kayıt başarılıysa veritabanından dönen veriyi (ID'si oluşmuş haliyle) yayınla
        // Bu sayede frontend'e giden veri ile DB'deki veri %100 eşleşir.
        io.emit("telemetry", savedRecord); 
        
        // Konsol çıktısı (isteğe bağlı)
        // console.log(`✅ DB Kaydı Başarılı & Socket Gönderildi: ${savedRecord.trainId}`);
        
    } catch (err) {
        console.error(" Veri veritabanına kaydedilemediği için gönderilmedi:", err);
    }
});
// --- TREN LİSTESİ ENDPOINT'İ ---
app.get("/api/trains", async (req, res) => {
    try {
        // 1. Veritabanındaki benzersiz trenlerin en son verilerini çekiyoruz
        const latestTrains = await Telemetry.aggregate([
            { $sort: { timestamp: -1 } }, // En yeni veriler en üste
            { 
                $group: { 
                    _id: "$trainId", 
                    lastData: { $first: "$$ROOT" } 
                } 
            },
            // 2.Trenleri alfabetik olarak sıraladım
            { $sort: { "_id": 1 } } 
        ]);

        // Sadece temiz veri objelerini döndürür
        res.json(latestTrains.map(t => t.lastData));
    } catch (err) {
        console.error("Tren listesi çekilemedi:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});
//bir trenin geçmiş verileri için
app.get("/api/trains/:id/history", async (req, res) => {
    try {
        const history = await Telemetry.find({ trainId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(100); // Son 100 nokta rotayı çizmeye yeter
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Geçmiş verisi alınamadı" });
    }
});



// Gelişmiş GET örneği:spesifik istekleri getirir e5007yi geti gibi
app.get("/api/telemetry", async (req, res) => {
    const { trainId, minSpeed } = req.query; // URL'den gelir: ?trainId=E5007&minSpeed=50
    let query = {};

    if (trainId) query.trainId = trainId;
    if (minSpeed) query.speed = { $gte: Number(minSpeed) };

    const data = await Telemetry.find(query).limit(100);
    res.json(data);
});
// Örnek bir Merkezi Hata Middleware'i (server.js'in sonuna, listen'dan önce eklenir)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: "error",
        message: err.message || "Dahili Sunucu Hatası",
        // Geliştirme aşamasında hatanın detayını görmek için:
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
});

server.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});