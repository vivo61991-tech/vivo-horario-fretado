self.addEventListener('push', event => {
  const options = {
    body: 'Notificação do Vivo - Fretado!',
    icon: 'favicon.png'
  };
  event.waitUntil(
    self.registration.showNotification('Vivo - Fretados', options)
  );
});