// Backend — Google Cloud VM (alert logic, incidents, recordings metadata)
const BACKEND = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")
  : `${window.location.protocol}//${window.location.hostname}:8000`;

// Stream server — Windows laptop (live MJPEG video feeds)
const STREAM_SERVER = import.meta.env.VITE_STREAM_URL
  ? import.meta.env.VITE_STREAM_URL.replace(/\/$/, "")
  : BACKEND;

const resolveUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url}`;
};

const api = {
  status: () => fetch(`${BACKEND}/status`).then((r) => r.json()),
  incidents: (sid) =>
    fetch(`${BACKEND}/incidents${sid ? `?session_id=${encodeURIComponent(sid)}` : ""}`).then((r) => r.json()),
  recordings: (sid) =>
    fetch(`${BACKEND}/recordings${sid ? `?session_id=${encodeURIComponent(sid)}` : ""}`).then((r) => r.json()),
  markReviewed: (id) => fetch(`${BACKEND}/incidents/${id}/review`, { method: "PATCH" }).then((r) => r.json()),
  cameras: () => fetch(`${BACKEND}/cameras`).then((r) => r.json()),
  setView: (id) =>
    fetch(`${BACKEND}/cameras/${encodeURIComponent(id)}/set_view`, { method: "POST" }).then((r) => r.json()),
  addCamera: (d) =>
    fetch(`${BACKEND}/cameras/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }).then((r) => r.json()),
  createSession: (d) =>
    fetch(`${BACKEND}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }).then((r) => r.json()),
  addLocalCamera: () => fetch(`${BACKEND}/cameras/add_local`, { method: "POST" }).then((r) => r.json()),
  refreshStream: () => fetch(`${STREAM_SERVER}/refresh`, { method: "POST" }).then((r) => r.json()),
};

let notifPermission = "default";

async function requestNotifPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    notifPermission = "granted";
    return;
  }
  if (Notification.permission !== "denied") {
    notifPermission = await Notification.requestPermission();
  }
}

function fireNotification(title, body) {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  if (notifPermission !== "granted") return;
  try {
    const n = new Notification(title, {
      body,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E",
      tag: "proctorio-incident",
      renotify: true,
    });
    setTimeout(() => n.close(), 6000);
  } catch {
    // Ignore notification errors on unsupported clients.
  }
}

export { BACKEND, STREAM_SERVER, resolveUrl, api, requestNotifPermission, fireNotification };
