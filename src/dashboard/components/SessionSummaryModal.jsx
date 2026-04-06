import { useCallback, useEffect, useRef, useState } from "react";
import { fmtDateTime } from "../utils";
import { api, resolveUrl } from "../api";

const fmtSec = (s) => {
  if (s == null || s < 0 || !Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const fmtMetric = (value, { asPercent = true, digits = 1 } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  if (!asPercent) return n.toFixed(digits);
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(digits)}%`;
};

// ─── Video player + timeline with incident markers ────────────────────────────
function VideoTimeline({ recording, incidents, seekTick }) {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [videoErr, setVideoErr] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);

  // External seek trigger
  useEffect(() => {
    if (!seekTick || !videoRef.current) return;
    videoRef.current.currentTime = seekTick.time;
    videoRef.current.play().catch(() => {});
  }, [seekTick]);

  // Reset error state when recording changes
  useEffect(() => {
    setVideoErr(false);
    setDuration(0);
    setCurTime(0);
  }, [recording?.url]);

  const handleTimelineClick = useCallback(
    (e) => {
      if (!timelineRef.current || !videoRef.current || !duration) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = pct * duration;
    },
    [duration],
  );

  const handleTimelineHover = useCallback(
    (e) => {
      if (!timelineRef.current || !duration) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverTime(pct * duration);
    },
    [duration],
  );

  const markers = incidents
    .map((inc) => ({
      id: inc.id,
      t: Number(inc.timestamp_offset) || 0,
      student: inc.student_id || "?",
      type: inc.incident_type || "",
    }))
    .filter((m) => m.t >= 0);

  if (!recording) {
    return (
      <div
        style={{
          padding: 20,
          textAlign: "center",
          fontSize: 10,
          color: "#4ade80",
          letterSpacing: ".1em",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 4,
        }}
      >
        NO RECORDING AVAILABLE FOR THIS CAMERA
      </div>
    );
  }

  return (
    <div>
      {/* Video element */}
      <div style={{ background: "#000", borderRadius: 4, overflow: "hidden" }}>
        {!videoErr ? (
          <video
            ref={videoRef}
            src={resolveUrl(recording.url)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onTimeUpdate={() => setCurTime(videoRef.current?.currentTime || 0)}
            onError={() => setVideoErr(true)}
            controls
            style={{ width: "100%", display: "block", maxHeight: 300 }}
          />
        ) : (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: ".1em" }}>
              VIDEO UNAVAILABLE
            </div>
            <div style={{ fontSize: 8, color: "#bbf7d0" }}>
              ffmpeg is not installed on the server. Install ffmpeg and restart the backend to enable in-browser playback.
            </div>
            <button
              onClick={() => setVideoErr(false)}
              style={{
                background: "transparent",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                fontSize: 9,
                letterSpacing: ".08em",
                padding: "3px 10px",
                cursor: "pointer",
                borderRadius: 3,
                fontFamily: "inherit",
              }}
            >
              ↺ RETRY
            </button>
            <a
              href={resolveUrl(recording.url)}
              download={recording.name}
              style={{
                color: "#16a34a",
                fontSize: 9,
                letterSpacing: ".1em",
                textDecoration: "none",
                border: "1px solid #bbf7d0",
                padding: "4px 12px",
                borderRadius: 3,
              }}
            >
              ↓ DOWNLOAD RECORDING
            </a>
          </div>
        )}
      </div>

      {/* Custom timeline with markers */}
      {duration > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineHover}
            onMouseLeave={() => setHoverTime(null)}
            title="Click to seek"
            style={{
              position: "relative",
              height: 32,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 4,
              cursor: "pointer",
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {/* Filled progress */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(curTime / duration) * 100}%`,
                background: "#dcfce7",
                pointerEvents: "none",
              }}
            />

            {/* Hover line */}
            {hoverTime != null && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoverTime / duration) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: "#86efac",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Incident markers */}
            {markers.map((m, i) => {
              const pct = (m.t / duration) * 100;
              if (pct < 0 || pct > 100) return null;
              return (
                <div
                  key={m.id || i}
                  title={`${m.student} · ${m.type} @ ${fmtSec(m.t)}`}
                  style={{
                    position: "absolute",
                    left: `${pct}%`,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: "#ef4444",
                    opacity: 0.85,
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                />
              );
            })}

            {/* Playhead */}
            <div
              style={{
                position: "absolute",
                left: `${(curTime / duration) * 100}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: "#15803d",
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            />

            {/* Hover time tooltip */}
            {hoverTime != null && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoverTime / duration) * 100}%`,
                  bottom: "calc(100% + 4px)",
                  transform: "translateX(-50%)",
                  background: "#14532d",
                  color: "#fff",
                  fontSize: 8,
                  padding: "2px 5px",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {fmtSec(hoverTime)}
              </div>
            )}
          </div>

          {/* Time labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
              fontSize: 9,
              color: "#4ade80",
              letterSpacing: ".06em",
            }}
          >
            <span>{fmtSec(curTime)}</span>
            <span style={{ color: "#ef4444" }}>
              {markers.length} incident marker{markers.length !== 1 ? "s" : ""}
            </span>
            <span>{fmtSec(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Per-student expandable row ───────────────────────────────────────────────
function StudentRow({ studentId, incidents, onSeek }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #bbf7d0",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: open ? "#dcfce7" : "#f0fdf4",
          cursor: "pointer",
          userSelect: "none",
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 6px #ef4444",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#14532d" }}>
            {studentId}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: ".08em",
              color: "#15803d",
              background: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: 999,
              padding: "2px 10px",
            }}
          >
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 10, color: "#16a34a" }}>{open ? "▴" : "▾"}</span>
        </div>
      </div>

      {open && (
        <div
          style={{
            background: "#f7fff9",
            borderTop: "1px solid #bbf7d0",
            padding: "8px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {incidents.map((inc, idx) => {
            const conf = inc.confidence > 0 ? `${(inc.confidence * 100).toFixed(1)}%` : null;
            const ts = Number(inc.timestamp_offset) || 0;
            return (
              <div
                key={inc.id || idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "7px 10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#ef4444",
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#166534",
                      letterSpacing: ".06em",
                      marginBottom: 2,
                    }}
                  >
                    {inc.incident_type || "UNKNOWN"}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#4ade80",
                      letterSpacing: ".06em",
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {conf && <span style={{ color: "#15803d" }}>CONF: {conf}</span>}
                    {inc.camera_id && <span>CAM: {inc.camera_id}</span>}
                    <span>{fmtDateTime(inc.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onSeek(ts)}
                  title={`Jump to ${fmtSec(ts)} in recording`}
                  style={{
                    background: "transparent",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    fontSize: 9,
                    letterSpacing: ".06em",
                    padding: "3px 8px",
                    cursor: "pointer",
                    borderRadius: 3,
                    fontFamily: "inherit",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  ▶ {fmtSec(ts)}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Single camera section (recording + timeline + student table) ─────────────
function CameraSection({ cameraId, recording, incidents }) {
  const [seekTick, setSeekTick] = useState(null);
  const handleSeek = (t) => setSeekTick({ time: t, id: Date.now() });

  const studentMap = {};
  for (const inc of incidents) {
    const sid = inc.student_id || "UNKNOWN";
    if (!studentMap[sid]) studentMap[sid] = [];
    studentMap[sid].push(inc);
  }
  const students = Object.entries(studentMap).sort((a, b) => b[1].length - a[1].length);

  return (
    <div
      style={{
        border: "1px solid #bbf7d0",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
        background: "#f7fff9",
      }}
    >
      {/* Camera header */}
      <div
        style={{
          padding: "10px 16px",
          background: "#dcfce7",
          borderBottom: "1px solid #bbf7d0",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".12em",
            color: "#14532d",
          }}
        >
          CAMERA: {cameraId}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: "#15803d",
            letterSpacing: ".08em",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 999,
            padding: "2px 8px",
          }}
        >
          {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Recording info bar */}
        <div
          style={{
            fontSize: 9,
            color: "#4ade80",
            letterSpacing: ".1em",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>▸ SESSION RECORDING</span>
          <span style={{ color: "#bbf7d0" }}>·</span>
          <span style={{ color: "#ef4444" }}>█</span>
          <span style={{ color: "#bbf7d0" }}>RED MARKERS = INCIDENTS</span>
          <span style={{ color: "#bbf7d0" }}>·</span>
          <span>CLICK TIMELINE OR ▶ TO SEEK</span>
        </div>

        <VideoTimeline recording={recording} incidents={incidents} seekTick={seekTick} />

        {/* Student table */}
        {students.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 9,
                color: "#4ade80",
                letterSpacing: ".1em",
                marginBottom: 8,
              }}
            >
              FLAGGED STUDENTS — CLICK TO EXPAND · ▶ JUMPS TO TIMESTAMP
            </div>
            {students.map(([sid, sincs]) => (
              <StudentRow key={sid} studentId={sid} incidents={sincs} onSeek={handleSeek} />
            ))}
          </div>
        )}

        {students.length === 0 && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 0",
              textAlign: "center",
              fontSize: 10,
              color: "#4ade80",
              letterSpacing: ".1em",
            }}
          >
            NO INCIDENTS FOR THIS CAMERA
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ sessionId, initialRecordings, onReady }) {
  const [recs, setRecs] = useState(initialRecordings || []);
  const [elapsed, setElapsed] = useState(0);
  const [polledOnce, setPolledOnce] = useState(false);
  const TIMEOUT_S = 180;

  // Ready when: polled at least once AND (no recordings OR all have browser_ready)
  const allReady = (list, didPoll) =>
    didPoll && (list.length === 0 || list.every((r) => r.browser_ready));

  useEffect(() => {
    let stopped = false;
    const startTime = Date.now();

    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const poll = async () => {
      if (stopped) return;
      const age = (Date.now() - startTime) / 1000;
      if (age >= TIMEOUT_S) {
        clearInterval(tick);
        onReady(recs);
        return;
      }
      try {
        const data = await api.recordings(sessionId);
        const list = (data.recordings || []).filter(
          (r) => !r.session_id || r.session_id === sessionId,
        );
        setRecs(list);
        setPolledOnce(true);
        if (allReady(list, true)) {
          clearInterval(tick);
          onReady(list);
          return;
        }
      } catch {
        // ignore, keep polling
      }
      if (!stopped) setTimeout(poll, 2500);
    };

    // Short initial delay so ffmpeg has time to start
    const initTimer = setTimeout(poll, 1000);

    return () => {
      stopped = true;
      clearTimeout(initTimer);
      clearInterval(tick);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const readyCount = recs.filter((r) => r.browser_ready).length;
  const totalCount = recs.length;
  const pct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : null;

  // Determine status label
  const phase = readyCount < totalCount && totalCount > 0
    ? (elapsed < 5 ? "INITIALIZING GPU TRANSCODE…" : "ENCODING WITH GPU / CPU…")
    : totalCount === 0 && polledOnce
    ? "NO RECORDINGS FOUND"
    : "WAITING FOR RECORDINGS…";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 40,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 48,
          height: 48,
          border: "3px solid #bbf7d0",
          borderTopColor: "#16a34a",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }}
      />

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".14em",
          color: "#15803d",
        }}
      >
        PROCESSING RECORDINGS
      </div>

      <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: ".1em" }}>
        {phase}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div style={{ width: "100%", maxWidth: 340 }}>
          <div
            style={{
              height: 8,
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg, #16a34a, #4ade80)",
                borderRadius: 999,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 9,
              color: "#4ade80",
              letterSpacing: ".08em",
              textAlign: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{readyCount} / {totalCount} CAMERAS READY</span>
            <span>{elapsed}s elapsed</span>
          </div>
        </div>
      )}

      {totalCount === 0 && (
        <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: ".08em" }}>
          {elapsed}s elapsed
        </div>
      )}

      <div style={{ fontSize: 9, color: "#86efac", letterSpacing: ".06em", textAlign: "center", maxWidth: 300 }}>
        Converting recordings to browser-compatible H.264.
        <br />
        GPU acceleration used when available (NVENC).
      </div>

      {/* Skip button after 15s with no progress */}
      {elapsed >= 15 && readyCount === 0 && (
        <button
          onClick={() => onReady(recs)}
          style={{
            background: "transparent",
            border: "1px solid #bbf7d0",
            color: "#16a34a",
            fontSize: 10,
            letterSpacing: ".08em",
            padding: "6px 16px",
            cursor: "pointer",
            borderRadius: 4,
            fontFamily: "inherit",
          }}
        >
          SKIP WAIT → VIEW REPORT
        </button>
      )}
    </div>
  );
}

// ─── Main report page ─────────────────────────────────────────────────────────
export default function SessionSummaryModal({
  session,
  incidents,
  recordings = [],
  onConfirmEnd,
  onBack,
}) {
  const [readyRecordings, setReadyRecordings] = useState(null); // null = still loading

  // Reset loading state whenever the page opens for a new session
  useEffect(() => {
    if (session) setReadyRecordings(null);
  }, [session?.session_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  // Filter recordings to this session
  const sessionRecordings = recordings.filter(
    (r) => !r.session_id || r.session_id === session.session_id,
  );

  const totalIncidents = incidents.length;

  // Collect all unique camera IDs from recordings and incidents
  const cameraIds = [];
  const seen = new Set();
  for (const r of readyRecordings || sessionRecordings) {
    const cid = r.camera_id || r.camera || r.name || "CAM";
    if (!seen.has(cid)) { seen.add(cid); cameraIds.push(cid); }
  }
  for (const inc of incidents) {
    const cid = inc.camera_id;
    if (cid && !seen.has(cid)) { seen.add(cid); cameraIds.push(cid); }
  }
  // Fallback: if no cameras but there are incidents, put them in an "ALL" bucket
  if (cameraIds.length === 0 && incidents.length > 0) cameraIds.push("ALL");

  const flaggedStudents = new Set(incidents.map((i) => i.student_id || "UNKNOWN")).size;
  const metrics = session?.metrics || session?.model_metrics || session?.report_metrics || {};
  const recallMetric = metrics.recall ?? session?.recall;
  const precisionMetric = metrics.precision ?? session?.precision;
  const aucMetric = metrics.auc_roc ?? metrics.auc ?? session?.auc_roc ?? session?.auc;

  const finalRecordings = readyRecordings || sessionRecordings;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0fdf4",
        fontFamily: "'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "0 16px 32px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 0 16px",
            borderBottom: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: ".12em",
                color: "#15803d",
                marginBottom: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SESSION SUMMARY REPORT
            </div>
            <div style={{ fontSize: 11, color: "#166534", letterSpacing: ".06em" }}>
              SESSION:&nbsp;<strong>{session.session_name}</strong>
            </div>
          </div>
          {readyRecordings !== null && (
            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                fontSize: 10,
                letterSpacing: ".1em",
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: 4,
                fontFamily: "inherit",
              }}
            >
              ← BACK TO SESSION
            </button>
          )}
        </div>

        {/* ── Stats row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
            background: "#bbf7d0",
            margin: "16px 0",
            borderRadius: 6,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {[
            { label: "TOTAL INCIDENTS", value: totalIncidents, accent: "#ef4444" },
            { label: "STUDENTS FLAGGED", value: flaggedStudents, accent: "#0891b2" },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              style={{ background: "#f0fdf4", padding: "16px 20px", textAlign: "center" }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: accent, letterSpacing: ".04em" }}>
                {value}
              </div>
              <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: ".1em", marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div
          style={{
            border: "1px solid #bbf7d0",
            borderRadius: 6,
            background: "#f0fdf4",
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".12em",
              color: "#15803d",
              marginBottom: 10,
            }}
          >
            MODEL PERFORMANCE METRICS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 8,
            }}
          >
            {[
              {
                label: "RECALL (SENSITIVITY)",
                value: fmtMetric(recallMetric, { asPercent: true, digits: 1 }),
                desc: "Crucial for security; how many real suspicious events were caught. Missing a real crime (false negative) is usually worse than a false alarm.",
              },
              {
                label: "PRECISION",
                value: fmtMetric(precisionMetric, { asPercent: true, digits: 1 }),
                desc: "How often system alerts are actually correct. Higher precision reduces alarm fatigue for security personnel.",
              },
              {
                label: "AUC-ROC",
                value: fmtMetric(aucMetric, { asPercent: false, digits: 3 }),
                desc: "Overall ability to distinguish normal vs suspicious activity across different sensitivity settings.",
              },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "#ffffff",
                  border: "1px solid #dcfce7",
                  borderRadius: 4,
                  padding: "10px 10px 9px",
                }}
              >
                <div style={{ fontSize: 9, color: "#166534", letterSpacing: ".08em", marginBottom: 5 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d", marginBottom: 5 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 9, lineHeight: 1.45, color: "#4ade80" }}>
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {readyRecordings === null ? (
            <LoadingScreen
              sessionId={session.session_id}
              initialRecordings={sessionRecordings}
              onReady={(recs) => setReadyRecordings(recs)}
            />
          ) : (
            <div style={{ flex: 1, padding: "14px 18px" }}>
              {cameraIds.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "30px 0",
                    color: "#4ade80",
                    fontSize: 11,
                    letterSpacing: ".1em",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  NO INCIDENTS OR RECORDINGS THIS SESSION
                </div>
              ) : (
                cameraIds.map((cid) => {
                  const camRec = finalRecordings.find(
                    (r) => (r.camera_id || r.camera || r.name || "CAM") === cid,
                  );
                  const camIncs = cid === "ALL"
                    ? incidents
                    : incidents.filter((i) => (i.camera_id || "ALL") === cid || (!i.camera_id && cid === cameraIds[0]));
                  return (
                    <CameraSection
                      key={cid}
                      cameraId={cid}
                      recording={camRec || null}
                      incidents={camIncs}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {readyRecordings !== null && (
          <div
            style={{
              paddingTop: 24,
              borderTop: "1px solid #bbf7d0",
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                fontSize: 11,
                letterSpacing: ".08em",
                padding: "8px 18px",
                cursor: "pointer",
                borderRadius: 4,
                fontFamily: "inherit",
              }}
            >
              ← BACK TO SESSION
            </button>
            <button
              onClick={onConfirmEnd}
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none",
                color: "#fff",
                fontSize: 11,
                letterSpacing: ".1em",
                fontWeight: 700,
                padding: "8px 20px",
                cursor: "pointer",
                borderRadius: 4,
                fontFamily: "inherit",
                boxShadow: "0 4px 12px #ef444440",
              }}
            >
              ✕ END SESSION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
