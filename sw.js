// sw.js — v2 com suporte robusto a notificações em background e tela bloqueada

self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

// Armazena timers agendados para poder cancelá-los
const timersAgendados = new Map();

self.addEventListener('message', event => {
    const data = event.data;
    if (!data) return;

    // ── Notificação imediata ou agendada ──────────────────────────────────────
    if (data.type === 'SCHEDULE_NOTIFICATION') {
        const { id, delay, title, options } = data;

        // Cancela agendamento anterior com o mesmo id (evita duplicatas)
        if (id && timersAgendados.has(id)) {
            clearTimeout(timersAgendados.get(id));
            timersAgendados.delete(id);
        }

        const showNotif = () => {
            const opts = Object.assign({
                icon: 'favicon.png',
                badge: 'favicon.png',
                vibrate: [200, 100, 200],
                tag: 'alerta-fretado',
                renotify: true,
                requireInteraction: false,   // não bloqueia tela
                silent: false,               // garante som/vibração
                timestamp: Date.now()
            }, options);

            self.registration.showNotification(title, opts);
            if (id) timersAgendados.delete(id);
        };

        if (!delay || delay <= 0) {
            // Disparo imediato — usa waitUntil para manter SW vivo
            event.waitUntil(Promise.resolve().then(showNotif));
        } else {
            // Agendado: usa waitUntil com Promise que só resolve após o delay
            const timerId = setTimeout(showNotif, delay);
            if (id) timersAgendados.set(id, timerId);

            event.waitUntil(new Promise(resolve => {
                setTimeout(resolve, delay + 500);
            }));
        }
    }

    // ── Cancela notificação agendada ─────────────────────────────────────────
    if (data.type === 'CANCEL_NOTIFICATION') {
        const { id } = data;
        if (id && timersAgendados.has(id)) {
            clearTimeout(timersAgendados.get(id));
            timersAgendados.delete(id);
        }
        self.registration.getNotifications({ tag: 'alerta-fretado' })
            .then(notifs => notifs.forEach(n => n.close()));
    }
});

// Toca ao clicar na notificação — abre ou foca o app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            const appUrl = self.registration.scope;
            for (const client of list) {
                if (client.url.startsWith(appUrl) && 'focus' in client)
                    return client.focus();
            }
            return clients.openWindow(appUrl);
        })
    );
});
