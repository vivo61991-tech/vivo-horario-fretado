// sw.js
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

// Escuta mensagens enviadas pelo index.html
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const delay = event.data.delay;
        const title = event.data.title;
        const options = event.data.options;

        // O setTimeout dentro do SW é mais estável que na aba, 
        // mas ainda pode ser limitado pelo sistema operativo.
        setTimeout(() => {
            self.registration.showNotification(title, options);
        }, delay);
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
