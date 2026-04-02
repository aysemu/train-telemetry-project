const fs = require('fs');
const path = require('path');

function splitTrains(inputFile) {
    const rawData = fs.readFileSync(inputFile);
    const allData = JSON.parse(rawData);

    // Trenleri depolayacağımız klasörü oluşturalım
    const outputDir = path.join(__dirname, 'data', 'trains');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. Verileri tren ID'sine göre grupla
    const grouped = {};
    allData.forEach(item => {
        if (!grouped[item.trainId]) {
            grouped[item.trainId] = [];
        }
        grouped[item.trainId].push(item);
    });

    // 2. Her grubu kendi zaman sırasına göre diz ve dosyaya yaz
    Object.keys(grouped).forEach(trainId => {
        // Zaman damgasına göre küçükten büyüğe sırala (Kronolojik sıra)
        const sortedData = grouped[trainId].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const filePath = path.join(outputDir, `${trainId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2));
        
        console.log(`✅ ${trainId} için ${sortedData.length} satır ayrıştırıldı: ${filePath}`);
    });

    console.log(`\n🚀 İşlem tamam! Toplam ${Object.keys(grouped).length} farklı tren dosyası oluşturuldu.`);
}

splitTrains('merged_train_data.json');