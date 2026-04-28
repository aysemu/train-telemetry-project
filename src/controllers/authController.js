// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        // Frontend'den gelen assignedTrain bilgisini de alıyoruz
        const { identifier, password, role, assignedTrain } = req.body; 

        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
            role: role
        });

        if (!user) {
            return res.status(401).json({ message: "Kullanıcı bulunamadı veya rol hatalı." });
        }

        // --- KRİTİK EKLEME: TREN DOĞRULAMA ---
        if (role === "makinist") {
            // Eğer makinistin seçtiği tren, DB'deki trenle aynı değilse girişi engelle
            if (user.assignedTrain !== assignedTrain) {
                return res.status(401).json({ 
                    message: `Yetki hatası! Siz ${user.assignedTrain} trenine atanmışsınız, ${assignedTrain} ile giriş yapamazsınız.` 
                });
            }
        }
        // -------------------------------------

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Hatalı şifre." });
        }

        // Token oluşturma ve başarılı yanıt...
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                trainId: user.assignedTrain 
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası." });
    }
};
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role, assignedTrain } = req.body;

        // E-posta kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Bu e-posta zaten kullanımda." });

        // Şifre şifreleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            assignedTrain: role === "makinist" ? assignedTrain : null // Sadece makinistler için tren atanır
        });

        await newUser.save();
        res.status(201).json({ message: "Kayıt başarılı!" });
    } catch (err) {
        res.status(500).json({ message: "Kayıt sırasında sunucu hatası oluştu." });
    }
};

// Tüm kullanıcıları getir (Test amaçlı)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Şifreleri çekme (güvenlik için)
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Kullanıcılar getirilemedi." });
    }
};

// Kullanıcı silme fonksiyonu
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id; // URL'den gelecek olan ID
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        res.status(200).json({ message: "Kullanıcı başarıyla silindi.", user: deletedUser });
    } catch (err) {
        res.status(500).json({ message: "Silme işlemi sırasında hata oluştu." });
    }
};

// TÜM kullanıcıları silme (Sadece geliştirme/test için!)
exports.deleteAllUsers = async (req, res) => {
    try {
        const result = await User.deleteMany({}); // Filtre boş olduğu için her şeyi siler
        res.status(200).json({ 
            message: "Tüm kullanıcılar başarıyla silindi.", 
            count: result.deletedCount // Kaç kişinin silindiğini döndürür
        });
    } catch (err) {
        res.status(500).json({ message: "Toplu silme sırasında hata oluştu." });
    }
};

// profile sayfasındaki güncellemeleri kaydetmek için
exports.updateProfile = async (req, res) => {
  try {
    const { email, name, phone, tcNo, address, bloodGroup, disabilityStatus } = req.body;

    // Email üzerinden kullanıcıyı bul ve güncelle
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, 
      { 
        name, 
        phone, 
        tcNo, 
        address, 
        bloodGroup, 
        disabilityStatus 
      },
      { new: true } // Güncellenmiş veriyi geri döndür
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({ 
      message: "Profil başarıyla güncellendi", 
      user: updatedUser 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
};
