const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    // Header'da 'Authorization' kısmında 'Bearer token' şeklinde gelir
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Login'deki anahtarla aynı olmalı //HOCAM HATA BURADAYMŞ HATALI TOKEN GİRMİŞİM DÜZENLERKEN
            req.user = decoded; // Kullanıcı bilgilerini (id, role, trainId) req nesnesine ekle
            next();
        } catch (error) {
            res.status(401).json({ message: "Yetkisiz erişim, token geçersiz!" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Token bulunamadı, lütfen giriş yapın!" });
    }
};

// Belirli rollere izin veren fonksiyon
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bu işlem için yetkiniz yok!" });
        }
        next();
    };
};

module.exports = { protect, authorize };