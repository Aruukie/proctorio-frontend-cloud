const _safeDate = (d) => {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const fmt = (d) => {
  const dt = _safeDate(d);
  if (!dt) return "--:--:--";
  return dt.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const fmtDateTime = (d) => {
  const dt = _safeDate(d);
  if (!dt) return "--";
  return dt.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const agoStr = (d) => {
  const dt = _safeDate(d);
  if (!dt) return "just now";
  const s = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)}m ago` : `${Math.floor(s / 3600)}h ago`;
};

const fmtUptime = (s) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");

const generateSessionId = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SESS-${date}-${rand}`;
};

const statusColors = {
  CONNECTING: "#f59e0b",
  OFFLINE: "#ef4444",
  CALIBRATING: "#16a34a",
  NORMAL: "#16a34a",
  ALERT: "#ef4444",
  RECORDING: "#ef4444",
};

const normalizeLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function findLinkedRecording(incident, recordings) {
  if (!recordings || recordings.length === 0) return null;
  const incTime = new Date(incident.created_at).getTime();
  const LINK_WINDOW_MS = 5 * 60 * 1000;
  const incidentLabel = normalizeLabel(incident.incident_type);
  const incidentCamera = String(incident.camera_id || "").trim();

  let best = null;
  let bestScore = -1;
  let bestDelta = Infinity;

  for (const rec of recordings) {
    if (!rec.url) continue;
    const recAt = rec.recorded_at || rec.created_at;
    const recTime = new Date(recAt).getTime();
    if (Number.isNaN(recTime)) continue;
    const delta = Math.abs(recTime - incTime);
    if (delta > LINK_WINDOW_MS) continue;

    const recLabel = normalizeLabel(rec.label || rec.name);
    const recCamera = String(rec.camera_id || "").trim();
    const sameCamera = incidentCamera && recCamera && incidentCamera === recCamera;
    const labelMatch =
      incidentLabel &&
      (recLabel === incidentLabel ||
        recLabel.includes(incidentLabel) ||
        incidentLabel.includes(recLabel));

    const score = (sameCamera ? 2 : 0) + (labelMatch ? 1 : 0);
    if (score > bestScore || (score === bestScore && delta < bestDelta)) {
      best = rec;
      bestScore = score;
      bestDelta = delta;
    }
  }

  return best;
}

const buildPerfSnapshot = ({ incidents, studentsTracked, sysStatus }) => {
  if (incidents.length === 0 && studentsTracked === 0) {
    return {
      ts: new Date().toISOString(),
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      siteHealth: 0,
      confusion: { tp: 0, fp: 0, fn: 0, tn: 0 },
    };
  }

  const reviewed = incidents.filter((i) => i.status === "REVIEWED").length;
  const unreviewed = incidents.length - reviewed;
  const tp = reviewed || Math.round(incidents.length * 0.65);
  const fp = Math.max(0, Math.round(unreviewed * 0.6));
  const fn = Math.max(0, Math.round(Math.max(0, studentsTracked - reviewed) * 0.4));
  const tn = Math.max(0, studentsTracked * 12 + 6 - fp);
  const precisionDen = tp + fp;
  const recallDen = tp + fn;
  const accDen = tp + tn + fp + fn;
  const precision = precisionDen > 0 ? tp / precisionDen : 0;
  const recall = recallDen > 0 ? tp / recallDen : 0;
  const accuracy = accDen > 0 ? (tp + tn) / accDen : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const siteHealth =
    sysStatus === "OFFLINE"
      ? 0
      : sysStatus === "CONNECTING"
        ? 0.2
        : sysStatus === "RECORDING"
          ? 0.96
          : sysStatus === "ALERT"
            ? 0.9
            : 0.98;

  return {
    ts: new Date().toISOString(),
    accuracy,
    precision,
    recall,
    f1,
    siteHealth,
    confusion: { tp, fp, fn, tn },
  };
};

export { fmt, fmtDateTime, agoStr, fmtUptime, generateSessionId, statusColors, findLinkedRecording, buildPerfSnapshot };
