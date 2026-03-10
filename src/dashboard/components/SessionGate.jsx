import { useState } from "react";
import { api } from "../api";
import { generateSessionId } from "../utils";

export default function SessionGate({ onSessionStart }) {
  const [mode, setMode] = useState("create");
  const [sessId, setSessId] = useState(generateSessionId());
  const [sessName, setSessName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    const id = mode === "create" ? sessId : joinId.trim();
    const name = mode === "create" ? sessName : joinId.trim();
    if (!id) {
      setError("Session ID is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.createSession({ session_id: id, session_name: name || id });
      onSessionStart({ session_id: id, session_name: name || id });
    } catch {
      setError("Could not connect to backend. Make sure server.py is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gate-overlay">
      <div className="gate-box">
        <div className="gate-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>PROCTORIO</span>
        </div>
        <div className="gate-title">EXAM SESSION SETUP</div>
        <div className="gate-subtitle">
          All incidents and recordings are scoped to a session. Create one per exam sitting.
        </div>

        <div className="gate-tabs">
          <button className={`gate-tab${mode === "create" ? " active" : ""}`} onClick={() => setMode("create")}>
            CREATE NEW
          </button>
          <button className={`gate-tab${mode === "join" ? " active" : ""}`} onClick={() => setMode("join")}>
            JOIN EXISTING
          </button>
        </div>

        {mode === "create" ? (
          <div className="gate-fields">
            <div className="gate-field">
              <label className="gate-label">SESSION ID</label>
              <div className="gate-id-row">
                <input
                  className="gate-input"
                  value={sessId}
                  onChange={(e) => setSessId(e.target.value.toUpperCase().replace(/\s/g, "-"))}
                  placeholder="SESS-20250226-XXXX"
                />
                <button className="gate-regen" onClick={() => setSessId(generateSessionId())} title="Regenerate ID">
                  ↻
                </button>
              </div>
            </div>
            <div className="gate-field">
              <label className="gate-label">
                SESSION NAME <span style={{ color: "#16a34a" }}>(optional)</span>
              </label>
              <input
                className="gate-input"
                value={sessName}
                onChange={(e) => setSessName(e.target.value)}
                placeholder="e.g. Midterm Exam - Room 301"
              />
            </div>
          </div>
        ) : (
          <div className="gate-fields">
            <div className="gate-field">
              <label className="gate-label">EXISTING SESSION ID</label>
              <input
                className="gate-input"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Enter the session ID to continue monitoring"
              />
            </div>
          </div>
        )}

        {error && <div className="gate-error">{error}</div>}

        <button className="gate-btn" onClick={handleStart} disabled={loading}>
          {loading ? "CONNECTING..." : mode === "create" ? "▶ START SESSION" : "▶ JOIN SESSION"}
        </button>

        <div className="gate-note">Sessions isolate incidents and recordings so rooms or exams never mix data.</div>
      </div>
    </div>
  );
}
