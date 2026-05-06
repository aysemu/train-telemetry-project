const router = require("express").Router();
const Fault = require("../models/Fault");

// 1. Yeni Arıza Kaydı Aç (Makinist için)
router.post("/create", async (req, res) => {
  try {
    const newFault = new Fault(req.body);
    await newFault.save();
    res.status(201).json(newFault);
  } catch (err) {
    res.status(500).json({ message: "Kayıt oluşturulamadı" });
  }
});
 
// 2. Arızaları Listele (Rol bazlı filtreleme)
router.get("/all", async (req, res) => {
  const { role, trainId, userId } = req.query;
  try {
    let query = {};
    if (role === "makinist") {
      query = { trainId: trainId }; // Makinist sadece kendi trenini görür
    }
    // Mühendis ve Admin zaten her şeyi göreceği için query boş kalır
    const faults = await Fault.find(query).sort({ createdAt: -1 });
    res.json(faults);
  } catch (err) {
    res.status(500).json({ message: "Veriler çekilemedi" });
  }
});

// bakımı kapatma ve mühendis yorum ekleme (Mühendis için)
router.put("/update/:id", async (req, res) => {
  // 1. ADIM: Frontend'den gelen objeleri parçalayarak alalım
  // resolvedBy burada gelmeli!
  const { status, engineerComment, resolvedBy } = req.body; 

  try {
    const updatedFault = await Fault.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status: status, 
          engineerComment: engineerComment, 
          resolvedBy: resolvedBy, // İŞTE BURASI! Eğer bu satır yoksa hep bilinmiyor yazar.
          resolvedAt: status === 'Çözüldü' ? Date.now() : null 
        } 
      },
      { returnDocument: 'after' } // O uyarıyı da böylece susturmuş olduk
    );

    if (!updatedFault) {
      return res.status(404).json({ message: "Arıza bulunamadı" });
    }

    res.json(updatedFault);
  } catch (err) {
    console.error("Güncelleme Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// routes/faultRoutes.js

// Arıza Kaydını Sil
router.delete("/delete/:id", async (req, res) => {
  try {
    await Fault.findByIdAndDelete(req.params.id);
    res.json({ message: "Kayıt silindi" });
  } catch (err) {
    res.status(500).json({ message: "Silme hatası" });
  }
});

// Arıza Kaydını Güncelle (Makinist için)
router.put("/update-makinist/:id", async (req, res) => {
  try {
    const updatedFault = await Fault.findByIdAndUpdate(
      req.params.id,
      req.body, // Yeni gelen issue, description, severity verileri
      { new: true }
    );
    res.json(updatedFault);
  } catch (err) {
    res.status(500).json({ message: "Güncelleme hatası" });
  }
});

module.exports = router;