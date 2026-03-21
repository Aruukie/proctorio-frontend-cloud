import { useEffect, useState } from "react";
import { BACKEND } from "../api";

export default function VideoWall({ cameras, isAlert, isRecording, recCountdown, recLabel, session, layout = "auto" }) {
  const [reloadByCam, setReloadByCam] = useState({});
  const [failedByCam, setFailedByCam] = useState({});
  const [loadedByCam, setLoadedByCam] = useState({});
  const [modalCamId, setModalCamId] = useState(null);

  useEffect(() => {
    const ids = new Set(cameras.map((c) => c.camera_id));
    setReloadByCam((prev) => {
      const next = {};
      cameras.forEach((c) => {
        next[c.camera_id] = prev[c.camera_id] || 0;
      });
      return next;
    });
    setFailedByCam((prev) => {
      const next = {};
      Object.entries(prev).forEach(([id, v]) => {
        if (ids.has(id)) next[id] = v;
      });
      return next;
    });
    setLoadedByCam((prev) => {
      const next = {};
      Object.entries(prev).forEach(([id, v]) => {
        if (ids.has(id)) next[id] = v;
      });
      return next;
    });
  }, [cameras]);

  useEffect(() => {
    if (!modalCamId) return;
    if (!cameras.some((c) => c.camera_id === modalCamId)) {
      setModalCamId(null);
    }
  }, [cameras, modalCamId]);

  useEffect(() => {
    if (!modalCamId) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setModalCamId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalCamId]);

  const retryCam = (camId) => {
    setFailedByCam((prev) => ({ ...prev, [camId]: false }));
    setLoadedByCam((prev) => ({ ...prev, [camId]: false }));
    setReloadByCam((prev) => ({ ...prev, [camId]: (prev[camId] || 0) + 1 }));
  };

  if (cameras.length === 0) {
    return (
      <div className="video-wall-empty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbf7d0" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: ".16em" }}>NO CAMERAS ADDED</div>
        <div style={{ fontSize: 8, color: "#bbf7d0", letterSpacing: ".08em" }}>Add a camera below to start monitoring</div>
      </div>
    );
  }

  const layoutClass =
    layout === "row" ? "layout-row" : layout === "2x2" ? "layout-2x2" : layout === "3x3" ? "layout-3x3" : "layout-auto";

  const modalCam = modalCamId ? cameras.find((c) => c.camera_id === modalCamId) : null;
  const modalFeedUrl = modalCam
    ? `${BACKEND}/video_feed?cam=${encodeURIComponent(modalCam.camera_id)}&v=${reloadByCam[modalCam.camera_id] || 0}`
    : null;
  const modalIsRecording = Boolean(
    modalCam && isRecording && recLabel && recLabel.startsWith(`${modalCam.camera_id}:`)
  );

  return (
    <>
      <div className={`video-wall-grid ${layoutClass}`}>
        {cameras.map((cam) => {
          const camId = cam.camera_id;
          const camMeta = cam.type === "local" ? "LOCAL" : `RTSP · ${cam.ip}`;
          const camRecording = Boolean(isRecording && recLabel && recLabel.startsWith(`${camId}:`));
          const feedUrl = `${BACKEND}/video_feed?cam=${encodeURIComponent(camId)}&v=${reloadByCam[camId] || 0}`;

          return (
            <div key={camId} className="video-tile viewing">
              <div className="video-tile-head">
                <div className="video-tile-title">{camId}</div>
                <div className="video-tile-actions">
                  {camRecording && (
                    <span className="video-tile-rec">
                      <span className="dot" style={{ background: "#ef4444", animation: "blink .7s step-end infinite" }} />
                      REC +{recCountdown}s
                    </span>
                  )}
                  <span className="cam-active-badge">● VIEWING</span>
                  <button className="video-expand-btn" onClick={() => setModalCamId(camId)}>
                    EXPAND
                  </button>
                </div>
              </div>

              <div
                className={`video-wrap video-tile-stream${isAlert ? " alerted" : ""}`}
                onClick={() => setModalCamId(camId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setModalCamId(camId);
                  }
                }}
              >
                <div className="scan-line" />
                <div className={`rec-overlay${camRecording ? " active" : ""}`} />

                {failedByCam[camId] ? (
                  <div className="no-feed">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.9 4.9 14.2 14.2" />
                    </svg>
                    <div style={{ fontSize: 9, letterSpacing: ".14em" }}>FEED UNAVAILABLE</div>
                    <button className="retry-btn" onClick={() => retryCam(camId)}>
                      RETRY
                    </button>
                  </div>
                ) : (
                  <img
                    className="video-feed"
                    src={feedUrl}
                    alt={camId}
                    onLoad={() => setLoadedByCam((prev) => ({ ...prev, [camId]: true }))}
                    onError={() => {
                      setLoadedByCam((prev) => ({ ...prev, [camId]: false }));
                      setFailedByCam((prev) => ({ ...prev, [camId]: true }));
                    }}
                    style={{ opacity: loadedByCam[camId] ? 1 : 0.2 }}
                  />
                )}

                <div className="video-labels">
                  <div className="video-label">{camMeta}</div>
                  {session && <div className="video-label" style={{ color: "#16a34a" }}>{session.session_id}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalCam && (
        <div className="video-modal-backdrop" onClick={() => setModalCamId(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-head">
              <div className="video-modal-title">{modalCam.camera_id}</div>
              <button className="video-modal-close-btn" onClick={() => setModalCamId(null)}>
                ✕ CLOSE
              </button>
            </div>
            <div className={`video-wrap video-modal-stream${isAlert ? " alerted" : ""}`}>
              <div className="scan-line" />
              <div className={`rec-overlay${modalIsRecording ? " active" : ""}`} />

              {failedByCam[modalCam.camera_id] ? (
                <div className="no-feed">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.9 4.9 14.2 14.2" />
                  </svg>
                  <div style={{ fontSize: 9, letterSpacing: ".14em" }}>FEED UNAVAILABLE</div>
                  <button className="retry-btn" onClick={() => retryCam(modalCam.camera_id)}>
                    RETRY
                  </button>
                </div>
              ) : (
                <img
                  className="video-feed"
                  src={modalFeedUrl}
                  alt={modalCam.camera_id}
                  onLoad={() => setLoadedByCam((prev) => ({ ...prev, [modalCam.camera_id]: true }))}
                  onError={() => {
                    setLoadedByCam((prev) => ({ ...prev, [modalCam.camera_id]: false }));
                    setFailedByCam((prev) => ({ ...prev, [modalCam.camera_id]: true }));
                  }}
                  style={{ opacity: loadedByCam[modalCam.camera_id] ? 1 : 0.2 }}
                />
              )}

              <div className="video-labels">
                <div className="video-label">{modalCam.type === "local" ? "LOCAL" : `RTSP · ${modalCam.ip}`}</div>
                {session && <div className="video-label" style={{ color: "#16a34a" }}>{session.session_id}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
