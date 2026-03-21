function normalizeBackend(raw) {
  const v = (raw || "").trim();
  if (!v) return "";
  return v.endsWith("/") ? v.slice(0, -1) : v;
}

const ENV_BACKEND = normalizeBackend(import.meta.env.VITE_BACKEND_URL);
const host = window.location.hostname || "127.0.0.1";
// Force HTTP by default. Using window.location.protocol can break when the UI
// is served over https but backend is plain http on :8000.
const BACKEND = ENV_BACKEND || `http://${host}:8000`;

const resolveUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url}`;
};

const withTs = (url) => {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_ts=${Date.now()}`;
};

const fetchJson = (url, options = {}) =>
  fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      ...(options.headers || {}),
    },
  }).then((r) => r.json());

const api = {
  status: () => fetchJson(withTs(`${BACKEND}/status`)),
  incidents: (sid) =>
    fetchJson(withTs(`${BACKEND}/incidents${sid ? `?session_id=${encodeURIComponent(sid)}` : ""}`)),
  recordings: (sid) =>
    fetchJson(withTs(`${BACKEND}/recordings${sid ? `?session_id=${encodeURIComponent(sid)}` : ""}`)),
  markReviewed: (id) => fetchJson(`${BACKEND}/incidents/${id}/review`, { method: "PATCH" }),
  cameras: () => fetchJson(withTs(`${BACKEND}/cameras`)),
  setView: (id) =>
    fetchJson(`${BACKEND}/cameras/${encodeURIComponent(id)}/set_view`, { method: "POST" }),
  closeCamera: async (id) => {
    const target = `${BACKEND}/cameras/${encodeURIComponent(id)}`;
    const fallback = `${BACKEND}/cameras/${encodeURIComponent(id)}/close`;

    try {
      const res = await fetch(withTs(target), {
        method: "DELETE",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      });
      if (res.ok) return res.json();
    } catch {
      // Ignore and try fallback below.
    }

    return fetchJson(withTs(fallback), { method: "POST" });
  },
  addCamera: (d) =>
    fetchJson(`${BACKEND}/cameras/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }),
  createSession: (d) =>
    fetchJson(`${BACKEND}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }),
  addLocalCamera: () => fetchJson(`${BACKEND}/cameras/add_local`, { method: "POST" }),
};

let notifPermission = "default";
let activeNotification = null;
let lastNotifAt = 0;
let titleResetTimer = null;
const originalTitle = typeof document !== "undefined" ? document.title : "";

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
  const now = Date.now();
  if (now - lastNotifAt < 1200) return; // prevent notification storms
  lastNotifAt = now;

  if (navigator.vibrate) navigator.vibrate([220, 120, 220]);

  if (typeof document !== "undefined") {
    document.title = `⚠ ${title}`;
    if (titleResetTimer) clearTimeout(titleResetTimer);
    titleResetTimer = setTimeout(() => {
      document.title = originalTitle || "Proctorio";
      titleResetTimer = null;
    }, 5000);
  }

  if (notifPermission !== "granted") return;
  try {
    if (activeNotification) {
      try {
        activeNotification.close();
      } catch {
        // Ignore close failures.
      }
      activeNotification = null;
    }
    const n = new Notification(title, {
      body,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2020/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E",
      tag: "proctorio-incident",
      renotify: true,
      requireInteraction: true,
    });
    activeNotification = n;
  } catch {
    // Ignore notification errors on unsupported clients.
  }
}

export { BACKEND, resolveUrl, api, requestNotifPermission, fireNotification };
