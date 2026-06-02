// sw.js
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

// Escuta mensagens enviadas pelo index.html
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { delay, title, options } = event.data;

        // Garante a estabilidade do ciclo de vida usando event.waitUntil
        event.waitUntil(
            new Promise(resolve => {
                setTimeout(() => {
                    self.registration.showNotification(title, options);
                    resolve();
                }, delay);
            })
        );
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('/');
        })
    );
});
