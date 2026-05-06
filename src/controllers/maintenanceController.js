const Maintenance = require('../models/Maintenance');
// User modeline bu dosyada artık ihtiyacımız yok, silebilirsin.

// 1. Yeni bakım planla (Mühendis/Admin)
exports.createMaintenance = async (req, res) => {
  try {
    const newMaintenance = new Maintenance(req.body);
    await newMaintenance.save();
    res.status(201).json(newMaintenance);
  } catch (err) {
    console.error("Planlama Hatası:", err);
    res.status(400).json({ message: "Planlama hatası: " + err.message });
  }
};

// 2. Tüm bakımları getir
exports.getMaintenances = async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ plannedDate: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Veriler çekilemedi" });
  }
};

// 3. Genel Güncelleme (Bakımı Düzenle)
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // HATA DÜZELTİLDİ: User yerine Maintenance modeli kullanıldı
    const updatedRecord = await Maintenance.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Güncellenecek kayıt bulunamadı." });
    }

    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error("Güncelleme Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası nedeniyle güncellenemedi." });
  }
};

// 4. Bakımı Tamamla (Makinist/Mühendis/Admin)
exports.completeMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const updated = await Maintenance.findByIdAndUpdate(
      id,
      { 
        status: 'Tamamlandı', 
        description: description,
        completedAt: new Date() 
      },
      { new: true } 
    );

    if (!updated) {
      return res.status(404).json({ message: "Bakım kaydı bulunamadı." });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Tamamlama Hatası:", err);
    res.status(500).json({ message: "Bakım tamamlanırken hata oluştu." });
  }
};

// 5. Bakımı Sil (Admin/Engineer)
exports.deleteMaintenance = async (req, res) => {
  try {
    const result = await Maintenance.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: "Silinecek kayıt bulunamadı" });
    }
    
    return res.status(200).json({ message: "Başarıyla silindi" }); 
  } catch (err) {
    console.error("Silme Hatası:", err);
    return res.status(400).json({ message: "Silme sırasında hata oluştu." });
  }
};



exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, user, role } = req.body;

    // Maintenance modelinde "comments" dizisine yeni yorumu ekliyoruz ($push)
    const updated = await Maintenance.findByIdAndUpdate(
      id,
      { 
        $push: { 
          comments: { 
            text, 
            user, 
            role, 
            createdAt: new Date() 
          } 
        } 
      },
      { new: true } // Güncellenmiş halini döndür
    );

    if (!updated) {
      return res.status(404).json({ message: "Bakım kaydı bulunamadı." });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Yorum Hatası:", err);
    res.status(500).json({ message: "Yorum eklenirken sunucu hatası oluştu." });
  }
};