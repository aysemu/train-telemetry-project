const mqtt = require('mqtt');
const Telemetry = require('../models/Telemetry'); // Modeli buradan çağırıyoruz
const { telemetrySchemaDTO } = require('../dtos/telemetryDTO');

class TelemetryService {
    constructor(io) {
        this.io = io;
        this.mqttClient = null;
    }
    init() {
        this.mqttClient = mqtt.connect('mqtt://localhost:1883');

        this.mqttClient.on('connect', () => {
            this.mqttClient.subscribe('tren/telemetri/#');
            console.log(" TelemetryService: MQTT üzerinden trenler dinleniyor...");
        });

        this.mqttClient.on('message', (topic, message) => this.handleMqttMessage(message));
    }
    async handleMqttMessage(message) {
        try {
            const rawData = JSON.parse(message.toString());

            // 1. DTO ile Veri Doğrulama
            const validatedData = telemetrySchemaDTO.parse({
                trainId: rawData.trainId,
                speed: Number(rawData.speed),
                latitude: Number(rawData.lat),
                longitude: Number(rawData.lon),
                temperature: Number(rawData.temperature),
                timestamp: rawData.timestamp
            });

            // 2. Veritabanına Kaydet
            // Artık Telemetry yukarıda require edildiği için çalışacak
            const savedRecord = await Telemetry.create(validatedData);

            // 3. Socket.io ile Real-time Yayınlama
            this.io.emit("telemetry", savedRecord);

        } catch (err) {
            console.error(" TelemetryService Hatası:", err.message);
        }
    }
}
module.exports = TelemetryService;