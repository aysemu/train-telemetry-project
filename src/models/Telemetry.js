const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema({
    trainId: { type: String, required: true },
    speed: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    temperature: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Veritabanında hızlı arama yapabilmek için trainId ve timestamp'e index ekleyelim (Profesyonel dokunuş)
telemetrySchema.index({ trainId: 1, timestamp: -1 });

module.exports = mongoose.model("Telemetry", telemetrySchema);