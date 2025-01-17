const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// VAPID Anahtarlarını Yükleme veya Oluşturma
let vapidKeys;
const vapidFilePath = './vapid.json';

if (fs.existsSync(vapidFilePath)) {
    vapidKeys = JSON.parse(fs.readFileSync(vapidFilePath));
} else {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(vapidFilePath, JSON.stringify(vapidKeys));
}

webpush.setVapidDetails(
    'mailto:your-email@example.com', // İletişim e-posta adresi
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

console.log('Public Key:', vapidKeys.publicKey);

// Kullanıcıların abonelik bilgilerini tutacak bir liste
let subscriptions = [];

// Abonelik Kaydetme API'si
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
    console.log('Yeni abonelik kaydedildi:', subscription);
});

// Bildirim Gönderme API'si
app.post('/send-notification', (req, res) => {
    const payload = JSON.stringify({
        title: 'Bildirim Başlığı',
        body: 'Bu bir test bildirimidir!',
    });

    Promise.all(
        subscriptions.map(sub =>
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Gönderim hatası:', err);
            })
        )
    ).then(() => res.status(200).json({ message: 'Bildirimler gönderildi!' }));
});

// Abonelikten Çıkma API'si
app.post('/unsubscribe', (req, res) => {
    const subscription = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
    res.status(200).json({ message: 'Abonelikten çıkıldı.' });
    console.log('Abonelikten çıkıldı:', subscription.endpoint);
});

// Frontend Dosyalarını Yayınlama
app.use(express.static(path.join(__dirname, 'public')));

// Sunucuyu Başlatma
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
