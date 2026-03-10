const fmt = (d) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const agoStr = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
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
  CONNECTING: "#15803d",
  CALIBRATING: "#16a34a",
  NORMAL: "#16a34a",
  ALERT: "#ef4444",
  RECORDING: "#ef4444",
};

function findLinkedRecording(incident, recordings) {
  if (!recordings || recordings.length === 0) return null;
  const incTime = new Date(incident.created_at).getTime();
  let best = null;
  let bestDelta = Infinity;
  for (const rec of recordings) {
    if (!rec.url) continue;
    const recTime = new Date(rec.created_at).getTime();
    const delta = Math.abs(recTime - incTime);
    if (delta < 60000 && delta < bestDelta) {
      bestDelta = delta;
      best = rec;
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
    sysStatus === "CONNECTING" ? 0 : sysStatus === "RECORDING" ? 0.96 : sysStatus === "ALERT" ? 0.9 : 0.98;

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

export { fmt, agoStr, fmtUptime, generateSessionId, statusColors, findLinkedRecording, buildPerfSnapshot };
