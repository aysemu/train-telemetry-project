const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  trainId: { type: String, required: true }, // E5001 gibi
  title: { type: String, required: true }, // Örn: "Fren Sistemi Kontrolü"
  description: { type: String },
  plannedDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Beklemede', 'Tamamlandı', 'İptal'], 
    default: 'Beklemede' 
  },
  priority: { 
    type: String, 
    enum: ['Düşük', 'Normal', 'Kritik'], 
    default: 'Normal' 
  },
  createdBy: { type: String }, // Oluşturan mühendisin adı
  completedAt: { type: Date },
  comments: [{
  user: String,
  role: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
}]
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);