const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Sadece giriş yapanlar (Makinist, Engineer, Admin) görebilir
router.get("/", protect, trainController.getLatestTrains);

// Sadece Engineer ve Admin geçmişi görebilir
router.get("/:id/history", protect, authorize("admin", "engineer"), trainController.getTrainHistory);

module.exports = router;