import { useEffect, useState } from "react";
import { agoStr, fmtDateTime } from "../utils";

function RecordingCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const [videoErr, setVideoErr] = useState(false);
  const isLive = rec.status === "RECORDING";

  return (
    <div className="rec-card" style={{ borderColor: isLive ? "#ef4444" : "#bbf7d0" }}>
      <div
        className="rec-card-header"
        onClick={() => rec.url && setExpanded((e) => !e)}
        style={{ cursor: rec.url ? "pointer" : "default" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLive ? (
            <span className="rec-live-dot" />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          )}
          <div>
            <div className="rec-type" style={{ color: isLive ? "#ef4444" : "#166534" }}>
              {rec.display_label || rec.label || rec.name}
            </div>
            <div className="rec-meta">{rec.display_meta || fmtDateTime(rec.created_at)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLive && (
            <>
              <span
                style={{
                  fontSize: 8,
                  color: "#ef4444",
                  letterSpacing: ".14em",
                  animation: "blink .7s step-end infinite",
                }}
              >
                RECORDING
              </span>
              {rec.countdown != null && <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700 }}>+{rec.countdown}s</span>}
            </>
          )}
          {!isLive && rec.url && <span style={{ fontSize: 8, color: "#15803d" }}>{expanded ? "▴" : "▾"}</span>}
          {!isLive && !rec.url && <span style={{ fontSize: 8, color: "#4ade80" }}>UPLOADING...</span>}
        </div>
      </div>

      {expanded && rec.url && (
        <div className="rec-player">
          {!videoErr ? (
            <video
              src={resolveUrl(rec.url)}
              controls
              onError={() => setVideoErr(true)}
              style={{ width: "100%", borderRadius: 2, maxHeight: 140 }}
            />
          ) : (
            <div
              style={{
                background: "#d1fae5",
                border: "1px solid #bbf7d0",
                borderRadius: 2,
                padding: "12px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 9, color: "#16a34a", letterSpacing: ".1em" }}>CODEC NOT SUPPORTED IN BROWSER</div>
              <div style={{ fontSize: 8, color: "#4ade80", letterSpacing: ".07em" }}>Install ffmpeg on server for H.264 encoding</div>
              <a
                href={resolveUrl(rec.url)}
                download={rec.name}
                style={{
                  display: "inline-block",
                  background: "transparent",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  padding: "4px 12px",
                  fontSize: 9,
                  letterSpacing: ".12em",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                DOWNLOAD CLIP
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IncidentRow({ incident }) {
  const [ago, setAgo] = useState(agoStr(incident.created_at));

  useEffect(() => {
    const t = setInterval(() => setAgo(agoStr(incident.created_at)), 5000);
    return () => clearInterval(t);
  }, [incident.created_at]);

  const title = `${incident.student_id || "UNKNOWN"}: ${incident.incident_type || "UNKNOWN"}`;
  const meta = [
    incident.confidence > 0 ? `${(incident.confidence * 100).toFixed(1)}% confidence` : null,
    incident.camera_id || "-",
    fmtDateTime(incident.created_at),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="incident-block" style={{ animation: "fadeIn .4s ease" }}>
      <div className="incident-header">
        <div
          className="incident-dot"
          style={{ background: "#ef4444", boxShadow: "0 0 6px #ef4444", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="incident-type">{title}</div>
          <div className="incident-meta">{meta}</div>
        </div>
        <div className="incident-ago">{ago}</div>
      </div>
    </div>
  );
}

function StandaloneRecordingRow({ rec }) {
  return (
    <div className="standalone-rec-block">
      <div style={{ fontSize: 7, color: "#4ade80", letterSpacing: ".14em", marginBottom: 4 }}>UNLINKED RECORDING</div>
      <RecordingCard rec={rec} />
    </div>
  );
}

export { RecordingCard, IncidentRow, StandaloneRecordingRow };
