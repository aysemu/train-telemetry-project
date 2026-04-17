const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");

// http://localhost:4000/api/trains/  altındaki yollar:
router.get("/", trainController.getLatestTrains);
router.get("/:id/history", trainController.getTrainHistory);
router.get("/telemetry", trainController.getFilteredTelemetry);

module.exports = router;