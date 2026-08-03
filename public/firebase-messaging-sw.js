importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config is injected at runtime via a postMessage from the main app
// because service workers cannot access import.meta.env
let messaging = null;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG' && !messaging) {
    firebase.initializeApp(event.data.config);
    messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon, data } = payload.notification ?? {};
      self.registration.showNotification(title ?? 'AlertGH Emergency', {
        body: body ?? 'A new incident has been reported.',
        icon: icon ?? '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag: data?.incidentId ?? 'alertgh-notif',
        renotify: true,
        data: data ?? {},
        actions: [
          { action: 'view', title: 'View on Map' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      });
    });
  }
});

// Notification click — focus or open the app and deep-link to the incident
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const incidentId = event.notification.data?.incidentId;
  const url = incidentId
    ? `${self.location.origin}/?incident=${incidentId}`
    : self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TO_INCIDENT', incidentId });
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
