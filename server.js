require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const trainRoutes = require("./src/routes/trainRoutes");
const TelemetryService = require("./src/services/telemetryService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware'ler
app.use(helmet());
// React uygulamanın adresine izin ver
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json()); // JSON gövdelerini okumak için şart
app.use("/api/auth", authRoutes);

// Veritabanı
mongoose.connect("mongodb://localhost:27017/tren_telemetri")
  .then(() => console.log("MongoDB Bağlantısı Başarılı"))
  .catch(err => console.error(" Bağlantı Hatası:", err));

// Rotalar
app.use("/api/trains", trainRoutes);

// --- SERVİSİ BAŞLAT ---
const telemetryService = new TelemetryService(io);
telemetryService.init();

// Hata Yakalayıcı (En sonda kalmalı)
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ status: "error", message: err.message });
});

server.listen(4000, () => console.log("🚀 Sunucu 4000 portunda hazır!"));