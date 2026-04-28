const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// EĞER BURADA register VARSA VE CONTROLLER'DA YOKSA SERVER ÇÖKER
if (authController.register) {
    router.post('/register', authController.register);
}
router.post("/login", authController.login);

// authRoutes.js içine ekle
router.get('/users', authController.getAllUsers);

// authRoutes.js içine ekle
// :id kısmı dinamiktir, oraya silmek istediğin kişinin ID'si gelecek
router.delete('/users/:id', authController.deleteUser);

// authRoutes.js içine ekle
// DİKKAT: Bu satırı router.delete('/users/:id', ...) satırının ÜSTÜNE yazman daha sağlıklı olur
router.delete('/users-all', authController.deleteAllUsers);

// Profil güncelleme rotası (PUT isteği)
router.put("/update-profile", authController.updateProfile);
module.exports = router;