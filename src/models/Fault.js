const mongoose = require("mongoose");

const faultSchema = new mongoose.Schema({
  trainId: { type: String, required: true }, // Hangi tren?
  reportedBy: { 
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    phone: String 
  }, // Makinisti bilgileriyle kaydediyoruz
  issue: { type: String, required: true }, // Arıza nedir?
  description: { type: String }, // Detaylı açıklama
  startTime: { type: Date, default: Date.now }, // Ne zaman fark edildi?
  severity: { type: String, enum: ['Düşük', 'Orta', 'Kritik'], default: 'Orta' },
  status: { type: String, enum: ['Açık', 'İnceleniyor', 'Çözüldü'], default: 'Açık' },
  
  // Mühendis müdahalesi için alanlar
  engineerComment: { type: String, default: "" },
  maintenanceType: { type: String, default: "" }, // Periyodik, Acil vb.
  resolvedAt: { type: Date },
  // kimin çözdüğünü görmek için 
  resolvedBy: {
    id: String,
    name: String
  },
}, { timestamps: true });

module.exports = mongoose.model("Fault", faultSchema);