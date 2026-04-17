const Telemetry = require("../models/Telemetry"); // Model dosyanı buraya bağlayacağız
// 1. Tüm trenlerin son konumlarını getirir
exports.getLatestTrains = async (req, res, next) => {
    try {
        const latestTrains = await Telemetry.aggregate([
            { $sort: { timestamp: -1 } },
            { 
                $group: { 
                    _id: "$trainId", 
                    lastData: { $first: "$$ROOT" } 
                } 
            },
            { $sort: { "_id": 1 } }
        ]);
        res.json(latestTrains.map(t => t.lastData));
    } catch (err) {
        next(err); // Hatayı merkezi yakalayıcıya paslar
    }
};
// 2. Bir trenin geçmiş verilerini getirir
exports.getTrainHistory = async (req, res, next) => {
    try {
        const history = await Telemetry.find({ trainId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(history);
    } catch (err) {
        next(err);
    }
};
// 3. Filtrelenmiş telemetri verilerini getirir
exports.getFilteredTelemetry = async (req, res, next) => {
    try {
        const { trainId, minSpeed } = req.query;
        let query = {};

        if (trainId) query.trainId = trainId;
        if (minSpeed) query.speed = { $gte: Number(minSpeed) };

        const data = await Telemetry.find(query).limit(100);
        res.json(data);
    } catch (err) {
        next(err);
    }
};