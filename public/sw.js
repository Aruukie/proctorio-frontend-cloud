// Proctorio Service Worker — handles background Web Push notifications

self.addEventListener("push", (event) => {
  let data = { title: "Proctorio Alert", body: "An incident was detected." };
  try {
    data = event.data.json();
  } catch {
    data.body = event.data ? event.data.text() : data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    "/vite.svg",
      badge:   "/vite.svg",
      tag:     "proctorio-incident",
      renotify: true,
      vibrate: [200, 100, 200],
      data:    data.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if open
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        // Otherwise open a new tab
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});
