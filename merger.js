const fs = require('fs');
const readline = require('readline');

async function mergeFiles(gpsFile, speedFile, outputFile) {
    try {
        console.log("🚀 Veri birleştirme işlemi başlıyor...");

        const readJsonLines = async (file) => {
            const data = [];
            const rl = readline.createInterface({
                input: fs.createReadStream(file),
                crlfDelay: Infinity
            });
            for await (const line of rl) {
                if (line.trim()) {
                    try {
                        data.push(JSON.parse(line));
                    } catch (e) { /* Hatalı satırı atla */ }
                }
            }
            return data;
        };

        const gpsRaw = await readJsonLines(gpsFile);
        const speedRaw = await readJsonLines(speedFile);

        console.log(`📊 GPS Kaydı: ${gpsRaw.length}, Hız Kaydı: ${speedRaw.length}`);

        // 1. Hız verilerini ID bazlı grupla ve zaman damgalarını sayıya çevir
        const speedLookup = {};
        speedRaw.forEach(s => {
            const id = s.device_id;
            const time = new Date(s.timestamp.$date).getTime();
            if (!speedLookup[id]) speedLookup[id] = [];
            speedLookup[id].push({ time, speed: s.loco_speed });
        });

        // 2. GPS verilerini işle ve en yakın hızı bul
        let mergedList = gpsRaw.map(gps => {
            const id = gps.device_id;
            const gpsTime = new Date(gps.timestamp.$date).getTime();
            
            let bestSpeed = 0;
            let minDiff = 60000; // 60 saniye tolerans (Sensör farkları için)

            if (speedLookup[id]) {
                // O trenin hız kayıtları içinde zamansal olarak en yakını bul
                for (let s of speedLookup[id]) {
                    const diff = Math.abs(gpsTime - s.time);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestSpeed = s.speed;
                    }
                }
            }

            return {
                trainId: id,
                latitude: gps.raw_data.latitude,
                longitude: gps.raw_data.longitude,
                speed: Number(bestSpeed) || 0,
                timestamp: gps.timestamp.$date, // ISO formatını koru
                timeMs: gpsTime // Sıralama için sayısal değer
            };
        });

        // 3. KRONOLOJİK SIRALAMA (Eskiden Yeniye)
        mergedList.sort((a, b) => a.timeMs - b.timeMs);

        // Gereksiz yardımcı alanı (timeMs) temizle
        const finalOutput = mergedList.map(({timeMs, ...rest}) => rest);

        // 4. Dosyaya Yaz
        if (finalOutput.length > 0) {
            fs.writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2));
            console.log(`✅ Başarılı! ${finalOutput.length} veri kronolojik olarak birleştirildi.`);
        } else {
            console.error("❌ Hata: Birleştirilecek veri bulunamadı.");
        }

    } catch (err) {
        console.error("💥 Kritik Hata:", err);
    }
}

mergeFiles('gps_february_2026.json', 'speed_february_2026.json', 'merged_train_data.json');