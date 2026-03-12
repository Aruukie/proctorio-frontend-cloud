import { useCallback, useEffect, useRef, useState } from "react";
import { api, fireNotification, requestNotifPermission } from "./dashboard/api";
import { buildPerfSnapshot, findLinkedRecording, fmt, fmtUptime } from "./dashboard/utils";
import { dashboardStyles, sessionGateStyles } from "./dashboard/styles";
import SessionGate from "./dashboard/components/SessionGate";
import VideoWall from "./dashboard/components/VideoWall";
import CameraPanel from "./dashboard/components/CameraPanel";
import DevToolsModal from "./dashboard/components/DevToolsModal";
import { IncidentRow, RecordingCard, StandaloneRecordingRow } from "./dashboard/components/FeedComponents";
import { MetricBox, SectionLabel, StatusBadge } from "./dashboard/components/SharedComponents";

function ToastLayer({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
        alignItems: "center",
        pointerEvents: "none",
        width: "calc(100% - 32px)",
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "alert" ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${t.type === "alert" ? "#ef444470" : "#16a34a70"}`,
            color: t.type === "alert" ? "#ef4444" : "#16a34a",
            padding: "10px 16px",
            fontSize: 11,
            letterSpacing: ".1em",
            fontFamily: "'Courier New', monospace",
            borderRadius: 2,
            animation: "slideUp .3s ease",
            boxShadow: "0 4px 24px #0f172a00080",
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
          }}
        >
          <span style={{ fontSize: 14 }}>{t.type === "alert" ? "⚠" : "✓"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export default function ExamProctorDashboard() {
  const [session, setSession] = useState(null);
  const [cameraList, setCameraList] = useState([]);
  const [uptime, setUptime] = useState(0);
  const [clock, setClock] = useState(new Date());
  const [alertFlash, setAlertFlash] = useState(false);

  const [sysStatus, setSysStatus] = useState("CONNECTING");
  const [studentsTracked, setStudentsTracked] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recCountdown, setRecCountdown] = useState(0);
  const [recLabel, setRecLabel] = useState(null);

  const [incidents, setIncidents] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [liveRec, setLiveRec] = useState(null);

  const knownIds = useRef(new Set());
  const wasRecording = useRef(false);

  const [toasts, setToasts] = useState([]);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [devToolsAuthed, setDevToolsAuthed] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devAuthError, setDevAuthError] = useState("");
  const [devAddCamLoading, setDevAddCamLoading] = useState(false);
  const [devAddCamMessage, setDevAddCamMessage] = useState("");
  const [perfSnapshotsBySession, setPerfSnapshotsBySession] = useState({});
  const [videoLayout, setVideoLayout] = useState("auto");

  const addToast = (msg, type = "alert") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  };

  const capturePerfSnapshot = useCallback(() => {
    const activeSessionId = session?.session_id;
    if (!activeSessionId) return;
    const point = buildPerfSnapshot({ incidents, studentsTracked, sysStatus });
    setPerfSnapshotsBySession((prev) => {
      const current = prev[activeSessionId] || [];
      return { ...prev, [activeSessionId]: [...current.slice(-11), point] };
    });
  }, [incidents, studentsTracked, sysStatus, session]);

  // ── Web Push registration ────────────────────────────────────────────────────
  const _swReg = useRef(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => { _swReg.current = reg; })
      .catch((e) => console.warn("[SW] Registration failed:", e));
  }, []);

  const _subscribeToPush = async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;

      const reg = _swReg.current || (await navigator.serviceWorker.ready);
      const { key } = await api.vapidPublicKey();

      // Convert base64url VAPID public key → Uint8Array
      const b64 = (key + "=".repeat((4 - (key.length % 4)) % 4))
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: raw,
      });
      await api.pushSubscribe(sub.toJSON());
    } catch (e) {
      console.warn("[Push] Subscribe failed:", e);
    }
  };

  const handleSessionStart = (sess) => {
    setSession(sess);
    requestNotifPermission();
    _subscribeToPush();
  };

  const handleEndSession = () => {
    setSession(null);
    setIncidents([]);
    setRecordings([]);
    knownIds.current = new Set();
    setIsDevToolsOpen(false);
    setDevToolsAuthed(false);
    setDevPassword("");
    setDevAuthError("");
  };

  const openDevTools = () => {
    setIsDevToolsOpen(true);
    setDevToolsAuthed(false);
    setDevPassword("");
    setDevAuthError("");
    setDevAddCamMessage("");
  };

  const closeDevTools = () => {
    setIsDevToolsOpen(false);
    setDevToolsAuthed(false);
    setDevPassword("");
    setDevAuthError("");
  };

  const unlockDevTools = () => {
    if (devPassword === "Admin123") {
      setDevToolsAuthed(true);
      setDevAuthError("");
      capturePerfSnapshot();
      return;
    }
    setDevAuthError("Invalid password");
  };

  const handleDevAddLocalCam = async () => {
    setDevAddCamLoading(true);
    setDevAddCamMessage("");
    try {
      const res = await api.addLocalCamera();
      if (res.ok) {
        setDevAddCamMessage(`✓ ${res.camera_id} - laptop webcam connected`);
        try {
          const cams = (await api.cameras()).cameras || [];
          setCameraList(cams);
        } catch {
          // Ignore camera refresh errors.
        }
      } else {
        setDevAddCamMessage(res.error || "Could not open webcam");
      }
    } catch {
      setDevAddCamMessage("Backend unreachable");
    } finally {
      setDevAddCamLoading(false);
    }
  };

  const handleDevTestNotification = () => {
    fireNotification("Test Incident - S1", "Hand-Suspiciousrotation · 91.3% · TEST");
    addToast("S1 - Hand-Suspiciousrotation (91.3%) [TEST]", "alert");
  };

  const sessionId = session?.session_id || null;
  const perfSnapshots = perfSnapshotsBySession[sessionId] || [];

  useEffect(() => {
    const t = setInterval(() => {
      setUptime((u) => u + 1);
      setClock(new Date());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try {
        const s = await api.status();
        if (s.is_recording) {
          setSysStatus("RECORDING");
          setIsRecording(true);
          setRecCountdown(s.recording_remaining);
          setRecLabel(s.recording_label);
          if (!wasRecording.current) {
            setAlertFlash(true);
            setTimeout(() => setAlertFlash(false), 600);
          }
        } else {
          setSysStatus("NORMAL");
          if (wasRecording.current) api.recordings(sessionId).then(setRecordings).catch(() => {});
          setIsRecording(false);
          setRecCountdown(0);
          setRecLabel(null);
        }
        wasRecording.current = s.is_recording;
        if (s.students_tracked !== undefined) setStudentsTracked(s.students_tracked);
      } catch {
        setSysStatus("CONNECTING");
        setIsRecording(false);
      }
    };
    poll();
    const t = setInterval(poll, 1000);
    return () => clearInterval(t);
  }, [session, sessionId]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try {
        const data = await api.incidents(sessionId);
        const newOnes = data.filter((i) => !knownIds.current.has(i.id));
        if (newOnes.length > 0 && knownIds.current.size > 0) {
          setAlertFlash(true);
          setTimeout(() => setAlertFlash(false), 600);
          newOnes.forEach((inc) => {
            const conf = inc.confidence > 0 ? ` (${(inc.confidence * 100).toFixed(0)}%)` : "";
            const student = inc.student_id ? ` · ${inc.student_id}` : "";
            fireNotification(`Incident Detected${student}`, `${inc.incident_type}${conf} · ${session?.session_name || ""}`);
            addToast(`${inc.student_id || "Student"} - ${inc.incident_type}${conf}`, "alert");
          });
        }
        data.forEach((i) => knownIds.current.add(i.id));
        setIncidents(data);
      } catch {
        // Ignore transient incident polling failures.
      }
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [session, sessionId]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      try {
        setRecordings(await api.recordings(sessionId));
      } catch {
        // Ignore transient recording polling failures.
      }
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [session, sessionId]);

  useEffect(() => {
    if (isRecording && recLabel) {
      setLiveRec({
        id: "live",
        label: recLabel,
        created_at: new Date().toISOString(),
        status: "RECORDING",
        countdown: recCountdown,
        url: null,
      });
    } else {
      setLiveRec(null);
    }
  }, [isRecording, recLabel, recCountdown]);

  const markReviewed = useCallback(async (id) => {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: "REVIEWED" } : i)));
    try {
      const res = await api.markReviewed(id);
      if (!res.ok) {
        setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: "UNREVIEWED" } : i)));
      }
    } catch {
      setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: "UNREVIEWED" } : i)));
    }
  }, []);

  const allRecordings = liveRec ? [liveRec, ...recordings] : recordings;
  const matchedRecIds = new Set();

  const incidentsWithRec = incidents.map((inc) => {
    const linked = findLinkedRecording(inc, allRecordings);
    if (linked) matchedRecIds.add(linked.id || linked.file_id);
    const isLive = isRecording && liveRec && inc.id === incidents[incidents.length - 1]?.id;
    return { inc, linked, isLive };
  });

  const unmatchedRecs = allRecordings.filter((r) => r.status !== "RECORDING" && !matchedRecIds.has(r.id || r.file_id));

  const isAlert = sysStatus === "ALERT" || sysStatus === "RECORDING";
  const unreviewed = incidents.filter((i) => i.status === "UNREVIEWED").length;
  const tickerText = `SESSION: ${session?.session_name || "-"} · SYSTEM: ${sysStatus} · INCIDENTS: ${incidents.length} · UNREVIEWED: ${unreviewed} · RECORDINGS: ${recordings.length} · STUDENTS: ${studentsTracked} · POLLING: 1s/3s/5s`;

  if (!session) {
    return (
      <>
        <style>{sessionGateStyles}</style>
        <SessionGate onSessionStart={handleSessionStart} />
      </>
    );
  }

  return (
    <>
      <style>{`${sessionGateStyles}${dashboardStyles}`}</style>
      <ToastLayer toasts={toasts} />

      <DevToolsModal
        open={isDevToolsOpen}
        isAuthed={devToolsAuthed}
        password={devPassword}
        authError={devAuthError}
        onPasswordChange={setDevPassword}
        onUnlock={unlockDevTools}
        onClose={closeDevTools}
        onAddLaptopCam={handleDevAddLocalCam}
        addCamLoading={devAddCamLoading}
        addCamMessage={devAddCamMessage}
        onSendTestNotif={handleDevTestNotification}
        perfSnapshots={perfSnapshots}
        videoLayout={videoLayout}
        onVideoLayoutChange={setVideoLayout}
      />

      <div className={`app${alertFlash ? " alert-flash" : ""}`}>
        <div className={`topbar${isAlert ? " alerted" : ""}`}>
          <div className="topbar-left">
            <div className="brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              PROCTORIO
            </div>
            <div className="vdivider" />
            <div className="brand-sub">EXAM MONITORING SYSTEM v3.0 · YOLO</div>
            <div className="vdivider" />
            <div className="session-chip">
              SESSION&nbsp;<strong>{session.session_name}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <StatusBadge status={sysStatus} />
            <div className="clock">
              <span className="uptime-chip">{fmtUptime(uptime)}</span>
              <span style={{ margin: "0 6px", color: "#4ade80" }}>|</span>
              {clock.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
              &nbsp;&nbsp;<strong>{fmt(clock)}</strong>
            </div>
            <button className="devtools-btn" onClick={openDevTools} title="Open developer tools">
              DEV TOOLS
            </button>
            <button className="session-end-btn" onClick={handleEndSession} title="End session and return to session gate">
              ✕ END SESSION
            </button>
          </div>
        </div>

        {isAlert && (
          <div className="alert-banner">
            <div className="alert-banner-text">
              <span
                className="dot"
                style={{ background: "#ef4444", boxShadow: "0 0 8px #ef4444", animation: "blink .6s step-end infinite" }}
              />
              INCIDENT DETECTED · {recLabel || "RECORDING IN PROGRESS"}
            </div>
            <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, letterSpacing: ".1em" }}>+{recCountdown}s remaining</span>
          </div>
        )}

        <div className="ticker-wrap">
          <span className="ticker-inner">
            {tickerText}&nbsp;&nbsp;◆&nbsp;&nbsp;{tickerText}&nbsp;&nbsp;◆&nbsp;&nbsp;{tickerText}
          </span>
        </div>

        <div className="main">
          <div className="left-panel">
            <div className="video-section">
              <SectionLabel>
                LIVE FEEDS · CAMERAS: {cameraList.length}
                <span className="poll-dot" title="Polling /status every 1s" />
              </SectionLabel>
              <VideoWall
                cameras={cameraList}
                isAlert={isAlert}
                isRecording={isRecording}
                recCountdown={recCountdown}
                recLabel={recLabel}
                session={session}
                layout={videoLayout}
              />
            </div>

            <div className="cam-metrics-row">
              <div className="cam-metrics-cam">
                <CameraPanel onCamerasUpdate={setCameraList} />
              </div>
              <div className="cam-metrics-stats">
                <SectionLabel>SESSION METRICS</SectionLabel>
                <div className="metrics-grid">
                  <MetricBox label="INCIDENTS" value={incidents.length} sub="this session" accent="#ef4444" />
                  <MetricBox
                    label="UNREVIEWED"
                    value={unreviewed}
                    sub="pending ack"
                    accent={unreviewed > 0 ? "#ef4444" : "#16a34a"}
                  />
                  <MetricBox label="RECORDINGS" value={recordings.length} sub="this session" accent="#0891b2" />
                  <MetricBox label="STUDENTS" value={studentsTracked} sub="tracked now" accent="#16a34a" />
                </div>
              </div>
            </div>
          </div>

          <div className={`sidebar${isAlert ? " alerted" : ""}`}>
            <div className="sidebar-header">
              <div className="sidebar-title">
                <span style={{ color: "#16a34a" }}>▸</span>
                INCIDENTS &amp; RECORDINGS
                <span className="poll-dot" />
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {unreviewed > 0 && <span className="tab-badge">{unreviewed} UNACK</span>}
                {isRecording && <span className="tab-badge" style={{ background: "#ef4444" }}>● REC</span>}
              </div>
            </div>

            <div className="unified-feed">
              {liveRec && (
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 7,
                      color: "#ef4444",
                      letterSpacing: ".14em",
                      marginBottom: 4,
                      animation: "blink .7s step-end infinite",
                    }}
                  >
                    ● ACTIVE CAPTURE
                  </div>
                  <RecordingCard rec={liveRec} />
                </div>
              )}

              {incidents.length === 0 && allRecordings.filter((r) => r.status !== "RECORDING").length === 0 ? (
                <div className="empty-state">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  NO ACTIVITY IN THIS SESSION
                </div>
              ) : (
                <>
                  {incidentsWithRec.length > 0 && (
                    <>
                      <div style={{ fontSize: 7, letterSpacing: ".18em", color: "#4ade80", marginBottom: 6 }}>
                        INCIDENT LOG - click to expand clip
                      </div>
                      {incidentsWithRec.map(({ inc, linked, isLive }) => (
                        <IncidentRow
                          key={inc.id}
                          incident={inc}
                          onReview={markReviewed}
                          linkedRec={linked}
                          isLiveRecording={isLive}
                        />
                      ))}
                    </>
                  )}

                  {unmatchedRecs.length > 0 && (
                    <>
                      <div style={{ fontSize: 7, letterSpacing: ".18em", color: "#4ade80", margin: "12px 0 6px" }}>
                        OTHER RECORDINGS
                      </div>
                      {unmatchedRecs.map((rec) => (
                        <StandaloneRecordingRow key={rec.id || rec.file_id} rec={rec} />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="sidebar-footer">
              <div className="endpoint-label">LIVE ENDPOINTS</div>
              <div className="endpoint-box">/status · /incidents · /recordings · /cameras</div>
              <div className="tech-stack">
                YOLO · OPENCV · FFMPEG H.264
                <br />
                APPWRITE DB · OBJECT STORAGE
                <br />
                RTSP · SESSION SCOPE
                <br />
                POLLING: 1s / 3s / 5s / 10s
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
