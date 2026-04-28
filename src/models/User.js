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
    default: "" 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'engineer', 'makinist'], 
    default: 'engineer' 
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
    // models/User.js içine ekle:
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