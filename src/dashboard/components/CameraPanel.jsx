import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

export default function CameraPanel({ onCamerasUpdate }) {
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [rtspUrl, setRtspUrl] = useState("");
  const [camName, setCamName] = useState("");
  const [adding, setAdding] = useState(false);
  const [closingId, setClosingId] = useState("");
  const [addResult, setAddResult] = useState(null);

  const fetchCameras = useCallback(async () => {
    try {
      const data = await api.cameras();
      const cams = data.cameras || [];
      setCameras(cams);
      onCamerasUpdate(cams);
      setError("");
      if (cams.length === 0) setShowAdd(true);
    } catch {
      setError("Could not load camera list");
    }
  }, [onCamerasUpdate]);

  useEffect(() => {
    fetchCameras();
    const t = setInterval(fetchCameras, 8000);
    return () => clearInterval(t);
  }, [fetchCameras]);

  const handleAdd = async () => {
    if (!rtspUrl.trim()) return;
    setAdding(true);
    setAddResult(null);
    try {
      const res = await api.addCamera({ rtsp_url: rtspUrl.trim(), camera_id: camName.trim() });
      if (res.ok) {
        const msg = res.auto_promoted ? `✓ ${res.camera_id} connected and set as detection camera` : `✓ ${res.camera_id} connected`;
        setAddResult({ ok: true, message: msg });
        setRtspUrl("");
        setCamName("");
        setShowAdd(false);
        await fetchCameras();
      } else {
        setAddResult({ ok: false, message: res.error || "Could not connect" });
      }
    } catch {
      setAddResult({ ok: false, message: "Backend unreachable" });
    } finally {
      setAdding(false);
    }
  };

  const handleCloseCamera = async (cameraId) => {
    if (!cameraId) return;
    setClosingId(cameraId);
    setAddResult(null);
    try {
      const res = await api.closeCamera(cameraId);
      if (res.ok) {
        setAddResult({ ok: true, message: `✓ ${cameraId} closed` });
        await fetchCameras();
      } else {
        setAddResult({ ok: false, message: res.error || `Could not close ${cameraId}` });
      }
    } catch {
      setAddResult({ ok: false, message: "Backend unreachable" });
    } finally {
      setClosingId("");
    }
  };

  return (
    <div className="cam-panel">
      <div className="cam-panel-header">
        <span style={{ color: "#16a34a" }}>▸</span>
        CAMERA SOURCES
        <div style={{ flex: 1, height: 1, background: "#bbf7d0" }} />
        <button
          className="cam-scan-btn"
          onClick={() => {
            setShowAdd((v) => !v);
            setAddResult(null);
          }}
        >
          {showAdd ? "✕ CANCEL" : "+ ADD"}
        </button>
      </div>

      {showAdd && (
        <div className="cam-add-form">
          <div className="cam-add-label">RTSP URL</div>
          <input
            className="cam-add-input"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://user:pass@192.168.x.x:554/stream2"
            spellCheck={false}
            autoCapitalize="none"
          />
          <div className="cam-add-label" style={{ marginTop: 6 }}>
            CAMERA ID <span style={{ color: "#4ade80" }}>(optional)</span>
          </div>
          <input
            className="cam-add-input"
            value={camName}
            onChange={(e) => setCamName(e.target.value)}
            placeholder="e.g. cam_room2  (auto-assigned if blank)"
          />
          {addResult && (
            <div
              style={{
                fontSize: 9,
                marginTop: 6,
                letterSpacing: ".06em",
                color: addResult.ok ? "#16a34a" : "#ef4444",
              }}
            >
              {addResult.message}
            </div>
          )}
          <button className="cam-add-btn" onClick={handleAdd} disabled={adding || !rtspUrl.trim()}>
            {adding ? "CONNECTING..." : "▶ CONNECT CAMERA"}
          </button>
        </div>
      )}

      {error && <div className="cam-error">{error}</div>}

      <div className="cam-list">
        {cameras.map((cam) => {
          const isViewing = Boolean(cam.viewing);
          const connected = cam.status === "CONNECTED";
          const typeLabel = cam.type === "local" ? "LOCAL · webcam" : `RTSP · ${cam.ip}`;
          return (
            <div key={cam.camera_id} className={`cam-item${isViewing ? " cam-active" : ""}`}>
              <div className="cam-item-left">
                <div
                  className="cam-status-dot"
                  style={{
                    background: connected ? "#16a34a" : "#ef4444",
                    boxShadow: connected ? "0 0 6px #16a34a" : "none",
                  }}
                />
                <div>
                  <div className="cam-id">{cam.camera_id}</div>
                  <div className="cam-meta">{typeLabel}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {isViewing && <span className="cam-active-badge">● VIEWING</span>}
                {!connected && <span className="cam-err-badge">ERR</span>}
                <button
                  className="cam-scan-btn"
                  onClick={() => handleCloseCamera(cam.camera_id)}
                  disabled={closingId === cam.camera_id}
                  title={`Close ${cam.camera_id}`}
                  style={{ padding: "2px 6px", color: "#ef4444", borderColor: "#ef444470" }}
                >
                  {closingId === cam.camera_id ? "CLOSING..." : "CLOSE"}
                </button>
              </div>
            </div>
          );
        })}

        {cameras.length === 0 && !showAdd && (
          <div className="cam-empty">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            No cameras - click + ADD
          </div>
        )}
      </div>
    </div>
  );
}
