const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Aynı maille iki kişi kaydolamaz
  },
  phone: { 
    type: String, 
    // Makinist girişi için bunu kullanacağız
    
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'engineer', 'makinist'], 
    
  },
  trainId: { 
    type: String, 
    default: null // Makinist atanmazsa null kalır
  },
  assignedTrain: { 
    type: String, 
    // Sadece makinistler için E5000, E5001 gibi değerler alacak
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  startDate: { 
    type: Date // İşe başlama tarihi için yeni alan
  }, 
  
  tcNo: {
     type: String, default: "" 
  },
  address: { 
    type: String, default: "" 
  },
  bloodGroup: { 
    type: String, default: "" 
  },
  disabilityStatus: { 
    type: String, default: "Yok" 
  },
});

module.exports = mongoose.model('User', userSchema);