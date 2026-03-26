import { useCallback, useEffect, useRef, useState } from "react";
import { api, fireNotification } from "./dashboard/api";
import { buildPerfSnapshot, findLinkedRecording, fmt, fmtUptime } from "./dashboard/utils";
import { dashboardStyles, sessionGateStyles } from "./dashboard/styles";
import SessionGate from "./dashboard/components/SessionGate";
import VideoWall from "./dashboard/components/VideoWall";
import CameraPanel from "./dashboard/components/CameraPanel";
import DevToolsModal from "./dashboard/components/DevToolsModal";
import { IncidentRow, RecordingCard, StandaloneRecordingRow } from "./dashboard/components/FeedComponents";
import { MetricBox, SectionLabel, StatusBadge } from "./dashboard/components/SharedComponents";
import SessionSummaryModal from "./dashboard/components/SessionSummaryModal";

const STATUS_POLL_MS = 2000;
const INCIDENTS_POLL_MS = 5000;
const RECORDINGS_POLL_MS = 8000;

const isTabHidden = () => typeof document !== "undefined" && document.visibilityState !== "visible";

function ToastLayer({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        alignItems: "center",
        pointerEvents: "none",
        width: "calc(100% - 32px)",
        maxWidth: 560,
      }}
    >
      <div
        style={{
          background: toast.type === "alert" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toast.type === "alert" ? "#ef4444aa" : "#16a34aaa"}`,
          color: toast.type === "alert" ? "#ef4444" : "#16a34a",
          padding: "12px 16px",
          fontSize: 13,
          letterSpacing: ".08em",
          fontFamily: "'Courier New', monospace",
          borderRadius: 4,
          animation: "slideUp .25s ease",
          boxShadow: "0 10px 30px #0f172a30",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          width: "100%",
          fontWeight: 700,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{toast.type === "alert" ? "⚠" : "✓"}</span>
          {toast.msg}
        </span>
        {toast.extraCount > 0 && (
          <span
            style={{
              background: toast.type === "alert" ? "#ef4444" : "#16a34a",
              color: "#ffffff",
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 12,
            }}
          >
            +{toast.extraCount} more
          </span>
        )}
      </div>
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
  const [studentsTrackedLive, setStudentsTrackedLive] = useState(0);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const [connectedCameras, setConnectedCameras] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recCountdown, setRecCountdown] = useState(0);
  const [recLabel, setRecLabel] = useState(null);
  const [recCameraId, setRecCameraId] = useState(null);

  const [incidents, setIncidents] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [liveRec, setLiveRec] = useState(null);
  const [incidentSort, setIncidentSort] = useState("latest");

  const knownIds = useRef(new Set());
  const wasRecording = useRef(false);

  const [toast, setToast] = useState(null);
  const toastHideTimer = useRef(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [devToolsAuthed, setDevToolsAuthed] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devAuthError, setDevAuthError] = useState("");
  const [devAddCamLoading, setDevAddCamLoading] = useState(false);
  const [devAddCamMessage, setDevAddCamMessage] = useState("");
  const [perfSnapshotsBySession, setPerfSnapshotsBySession] = useState({});
  const [videoLayout, setVideoLayout] = useState("auto");

  const sessionId = session?.session_id || null;

  const addToast = useCallback((msg, type = "alert") => {
    setToast((prev) => {
      if (prev && prev.type === type) {
        return {
          ...prev,
          msg,
          extraCount: (prev.extraCount || 0) + 1,
          ts: Date.now(),
        };
      }
      return { msg, type, extraCount: 0, ts: Date.now() };
    });

    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    toastHideTimer.current = setTimeout(() => {
      setToast(null);
      toastHideTimer.current = null;
    }, 8000);
  }, []);

  const capturePerfSnapshot = useCallback(() => {
    const activeSessionId = session?.session_id;
    if (!activeSessionId) return;
    const point = buildPerfSnapshot({ incidents, studentsTracked, sysStatus });
    setPerfSnapshotsBySession((prev) => {
      const current = prev[activeSessionId] || [];
      return { ...prev, [activeSessionId]: [...current.slice(-11), point] };
    });
  }, [incidents, studentsTracked, sysStatus, session]);

  const handleSessionStart = async (sess) => {
    setSession(sess);
    setSysStatus("CONNECTING");
    setIsRecording(false);
    setRecCountdown(0);
    setRecLabel(null);
  };

  const handleEndSession = () => {
    setShowSummary(true);
  };

  const handleConfirmEndSession = () => {
    setShowSummary(false);
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

  const perfSnapshots = perfSnapshotsBySession[sessionId] || [];

  useEffect(() => {
    const t = setInterval(() => {
      setUptime((u) => u + 1);
      setClock(new Date());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(
    () => () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      if (isTabHidden()) return;
      try {
        const s = await api.status();
        const toCount = (v) => {
          const n = Number(v);
          return Number.isFinite(n) ? Math.max(0, n) : 0;
        };
        const liveCount = toCount(s.students_tracked_live);
        const registeredCount = toCount(s.students_registered);
        const trackedCount = toCount(s.students_tracked);
        const connectedCount = toCount(s.connected_cameras);
        setStudentsTrackedLive(liveCount);
        setStudentsRegistered(registeredCount);
        setConnectedCameras(connectedCount);
        setStudentsTracked(Math.max(trackedCount, liveCount, registeredCount, connectedCount));
        if (s.is_recording) {
          setSysStatus("RECORDING");
          setIsRecording(true);
          setRecCountdown(s.recording_remaining);
          setRecLabel(s.recording_label);
          setRecCameraId(s.recording_camera_id || null);
          if (!wasRecording.current) {
            setAlertFlash(true);
            setTimeout(() => setAlertFlash(false), 600);
            const recText = s.recording_label ? `Recording started: ${s.recording_label}` : "Recording started";
            fireNotification("Incident Triggered", recText);
            addToast(recText, "alert");
          }
        } else {
          setSysStatus("NORMAL");
          if (wasRecording.current) api.recordings(sessionId).then((r) => setRecordings(r.recordings || [])).catch(() => {});
          setIsRecording(false);
          setRecCountdown(0);
          setRecLabel(null);
          setRecCameraId(null);
        }
        wasRecording.current = s.is_recording;
      } catch {
        setSysStatus("OFFLINE");
        setIsRecording(false);
        setRecCameraId(null);
      }
    };
    poll();
    const t = setInterval(poll, STATUS_POLL_MS);
    return () => clearInterval(t);
  }, [session, sessionId]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      if (isTabHidden()) return;
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
    const t = setInterval(poll, INCIDENTS_POLL_MS);
    return () => clearInterval(t);
  }, [session, sessionId]);

  useEffect(() => {
    if (!session) return;
    const poll = async () => {
      if (isTabHidden()) return;
      try {
        setRecordings((await api.recordings(sessionId)).recordings || []);
      } catch {
        // Ignore transient recording polling failures.
      }
    };
    poll();
    const t = setInterval(poll, RECORDINGS_POLL_MS);
    return () => clearInterval(t);
  }, [session, sessionId]);

  useEffect(() => {
    if (isRecording && recLabel) {
      setLiveRec({
        id: "live",
        label: recLabel,
        display_meta: [recCameraId, new Date().toLocaleString("en-US", { hour12: false })].filter(Boolean).join(" · "),
        created_at: new Date().toISOString(),
        status: "RECORDING",
        countdown: recCountdown,
        url: null,
      });
    } else {
      setLiveRec(null);
    }
  }, [isRecording, recLabel, recCountdown, recCameraId]);

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
  const availableRecordings = [...allRecordings];
  const sortedIncidents = [...incidents].sort((a, b) => {
    if (incidentSort === "confidence") {
      const confDelta = (b.confidence || 0) - (a.confidence || 0);
      if (confDelta !== 0) return confDelta;
    }
    if (incidentSort === "incident_type") {
      const typeDelta = String(a.incident_type || "").localeCompare(String(b.incident_type || ""), undefined, { sensitivity: "base" });
      if (typeDelta !== 0) return typeDelta;
    }
    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  });

  const incidentsWithRec = sortedIncidents.map((inc) => {
    const linked = findLinkedRecording(inc, availableRecordings);
    if (linked) {
      const linkedId = linked.id || linked.file_id;
      matchedRecIds.add(linkedId);
      const idx = availableRecordings.findIndex((r) => (r.id || r.file_id) === linkedId);
      if (idx >= 0) availableRecordings.splice(idx, 1);
    }
    const isLive = isRecording && liveRec && inc.id === incidents[0]?.id;
    return { inc, linked, isLive };
  });

  const unmatchedRecs = availableRecordings.filter((r) => r.status !== "RECORDING" && !matchedRecIds.has(r.id || r.file_id));

  const isAlert = sysStatus === "ALERT" || sysStatus === "RECORDING";
  const unreviewed = incidents.filter((i) => i.status === "UNREVIEWED").length;
  const connectedFromList = cameraList.filter((c) => c.status === "CONNECTED").length;
  const dynamicStudentCount = Math.max(studentsTracked, studentsTrackedLive, studentsRegistered, connectedCameras, connectedFromList);
  const tickerText = `SESSION: ${session?.session_name || "-"} · SYSTEM: ${sysStatus} · INCIDENTS: ${incidents.length} · UNREVIEWED: ${unreviewed} · RECORDINGS: ${recordings.length} · STUDENTS: ${dynamicStudentCount} · POLLING: 2s/5s/8s`;

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
      <ToastLayer toast={toast} />

      <SessionSummaryModal
        session={showSummary ? session : null}
        incidents={incidents}
        recordings={recordings}
        onConfirmEnd={handleConfirmEndSession}
        onCancel={() => setShowSummary(false)}
      />

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
        sessionId={sessionId}
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
            <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, letterSpacing: ".06em" }}>+{recCountdown}s remaining</span>
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
                <span className="poll-dot" title="Polling /status every 2s (pauses when tab is hidden)" />
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
                  <MetricBox label="STUDENTS" value={dynamicStudentCount} sub="dynamic live count" accent="#16a34a" />
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
                      fontSize: 10,
                      color: "#ef4444",
                      letterSpacing: ".08em",
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ fontSize: 10, letterSpacing: ".08em", color: "#4ade80" }}>
                          INCIDENT LOG - click to expand clip
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "#16a34a", letterSpacing: ".08em" }}>
                          SORT
                          <select
                            value={incidentSort}
                            onChange={(e) => setIncidentSort(e.target.value)}
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#166534",
                              fontSize: 10,
                              letterSpacing: ".04em",
                              padding: "4px 6px",
                              borderRadius: 2,
                            }}
                          >
                            <option value="latest">Latest</option>
                            <option value="confidence">Confidence Level</option>
                            <option value="incident_type">Incident Type</option>
                          </select>
                        </label>
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
                      <div style={{ fontSize: 10, letterSpacing: ".08em", color: "#4ade80", margin: "12px 0 6px" }}>
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
                APPWRITE DB · LOCAL RECORDINGS
                <br />
                RTSP · SESSION SCOPE
                <br />
                POLLING: 2s / 5s / 8s (paused on hidden tab)
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
