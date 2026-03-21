// Proctorio Service Worker — handles background Web Push notifications

self.addEventListener("push", (event) => {
  let data = { title: "Proctorio Alert", body: "An incident was detected." };
  try {
    data = event.data.json();
  } catch {
    data.body = event.data ? event.data.text() : data.body;
  }

  // Use a different tag for recordings so they don't replace incident notifications
  const isRecording = (data.data || {}).type === "recording";
  const tag = isRecording ? "proctorio-recording" : "proctorio-incident";

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:     data.body,
      icon:     "/vite.svg",
      badge:    "/vite.svg",
      tag:      tag,
      renotify: true,
      vibrate:  [200, 100, 200],
      data:     data.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Build target URL: recordings tab if this is a recording notification
        const target = notifData.type === "recording" ? "/?tab=recordings" : "/";

        // Focus and navigate existing tab if open
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.focus();
            client.postMessage({ type: "NAVIGATE", tab: notifData.type === "recording" ? "recordings" : null });
            return;
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) return clients.openWindow(target);
      })
  );
});
