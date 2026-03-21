import { statusColors } from "../utils";

function StatusBadge({ status }) {
  const color = statusColors[status] || "#f59e0b";
  const pulse = status === "ALERT" || status === "RECORDING";
  return (
    <span className="status-badge" style={{ borderColor: color, color }}>
      <span
        className="dot"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}`,
          animation: pulse ? "blink .7s step-end infinite" : "none",
        }}
      />
      {status}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="section-label">
      <span style={{ color: "#16a34a" }}>▸</span>
      {children}
      <div style={{ flex: 1, height: 1, background: "#bbf7d0" }} />
    </div>
  );
}

function MetricBox({ label, value, sub, accent = "#16a34a" }) {
  return (
    <div className="metric-box">
      <div className="metric-accent" style={{ background: accent }} />
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

export { StatusBadge, SectionLabel, MetricBox };
