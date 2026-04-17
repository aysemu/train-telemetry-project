const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");

const trainRoutes = require("./src/routes/trainRoutes");
const TelemetryService = require("./src/services/telemetryService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware'ler
app.use(helmet());
app.use(cors());
app.use(express.json());

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