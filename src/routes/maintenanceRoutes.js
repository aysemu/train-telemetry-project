const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
// const auth = require('../middleware/authMiddleware'); // Yetki kontrolü için

// Tüm bakımları getir (Makinist, Mühendis, Admin)
router.get('/', maintenanceController.getMaintenances);

// Yeni bakım planla (Sadece Mühendis ve Admin)
router.post('/add', maintenanceController.createMaintenance);

// Bakım durumunu güncelle (Örn: Beklemede -> Tamamlandı)
router.put('/update/:id', maintenanceController.updateMaintenance);

router.put('/complete/:id', maintenanceController.completeMaintenance);

router.delete('/:id', maintenanceController.deleteMaintenance);

router.post('/:id/comment', maintenanceController.addComment);

module.exports = router;