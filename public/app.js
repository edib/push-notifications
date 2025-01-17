const publicVapidKey = 'BE2c7sh8CxZNXEm-fb9Qn2Kh_jBMzWQrn70BKxrjoW5hJ5676PYVbAEMXrUdojnPew2wry41R6_6SoibaUgAWlY'; // Server.js'den aldığınız Public Key

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker kayıtlı:', registration);

        // Abonelik oluşturma
        document.getElementById('subscribe').addEventListener('click', async () => {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Abonelik tamamlandı.');
        });

        // Abonelikten çıkma
        document.getElementById('unsubscribe').addEventListener('click', async () => {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                await fetch('/unsubscribe', {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Abonelikten çıkıldı.');
            } else {
                console.log('Abonelik bulunamadı.');
            }
        });

        // Bildirim gönderme
        document.getElementById('send').addEventListener('click', async () => {
            await fetch('/send-notification', { method: 'POST' });
        });
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
