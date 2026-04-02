const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const mqtt = require('mqtt'); // MQTT eklendi

const app = express();
app.use(cors());
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
        
        //simülatörde farklıydı lat lon çevri
        const data = {
            trainId: rawData.trainId,
            speed: Number(rawData.speed),
            latitude: Number(rawData.lat),
            longitude: Number(rawData.lon),
            temperature:Number(rawData.temperature),
            timestamp: rawData.timestamp
        };

        const newRecord = new Telemetry(data);
        await newRecord.save();

        io.emit("telemetry", data);
        //console.log(`📥 Düzenlenmiş veri yayında: ${data.trainId}`);
    } catch (err) {
        console.error("Veri işleme hatası:", err);
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
            // 2. KRİTİK: Trenleri alfabetik olarak sırala (E5001, E5002...)
            { $sort: { "_id": 1 } } 
        ]);

        // Sadece temiz veri objelerini döndür
        res.json(latestTrains.map(t => t.lastData));
    } catch (err) {
        console.error("Tren listesi çekilemedi:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

server.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});