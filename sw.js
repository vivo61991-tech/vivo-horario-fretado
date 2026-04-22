// sw.js

// Instalação do Service Worker
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Ativação e limpeza de cache se necessário
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// 1. Ouvir eventos de Push (Notificações enviadas pelo servidor)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Notificação do Vivo - Fretado!',
        icon: 'favicon.png',
        badge: 'favicon.png', // Ícone pequeno que aparece na barra de status
        vibrate: [200, 100, 200],
        tag: 'alerta-fretado',
        renotify: true,
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Vivo - Fretados', options)
    );
});

// 2. Lógica para quando o usuário clica na notificação
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});
