function MiniTrendChart({
  title,
  description,
  points,
  color,
  formatter = (v) => `${(v * 100).toFixed(1)}%`,
  legendLabel = "Metric",
}) {
  const width = 220;
  const height = 80;
  const pad = 8;
  const hasData = points.length > 0;
  const min = hasData ? Math.min(...points) : 0;
  const max = hasData ? Math.max(...points) : 0;
  const spread = hasData ? Math.max(0.0001, max - min) : 0;
  const path = hasData
    ? points
        .map((v, i) => {
          const x = pad + (i * (width - pad * 2)) / Math.max(1, points.length - 1);
          const y = height - pad - ((v - min) / spread) * (height - pad * 2);
          return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ")
    : "";
  const last = hasData ? points[points.length - 1] : null;

  return (
    <div className="dev-chart-card">
      <div className="dev-chart-head">
        <span>{title}</span>
        <strong>{hasData ? formatter(last) : "--"}</strong>
      </div>
      {description && <div className="dev-chart-desc">{description}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="dev-chart-svg" role="img" aria-label={title}>
        <rect x="0" y="0" width={width} height={height} fill="#f7fef9" />
        {hasData ? (
          <path d={path} fill="none" stroke={color} strokeWidth="2" />
        ) : (
          <text x={width / 2} y={height / 2} textAnchor="middle" fill="#86efac" fontSize="10" letterSpacing="1">
            NO DATA YET
          </text>
        )}
      </svg>
      <div className="dev-legend">
        <span className="dev-legend-item">
          <span className="dev-legend-dot" style={{ background: color }} />
          {legendLabel}
        </span>
      </div>
    </div>
  );
}

export default function DevToolsModal({
  open,
  isAuthed,
  password,
  authError,
  onPasswordChange,
  onUnlock,
  onClose,
  onAddLaptopCam,
  addCamLoading,
  addCamMessage,
  onSendTestNotif,
  perfSnapshots,
  videoLayout,
  onVideoLayoutChange,
}) {
  if (!open) return null;

  const accuracySeries = perfSnapshots.map((p) => p.accuracy);
  const precisionSeries = perfSnapshots.map((p) => p.precision);
  const recallSeries = perfSnapshots.map((p) => p.recall);
  const f1Series = perfSnapshots.map((p) => p.f1);
  const siteSeries = perfSnapshots.map((p) => p.siteHealth);
  const latest = perfSnapshots[perfSnapshots.length - 1];

  return (
    <div className="dev-modal-backdrop" onClick={onClose}>
      <div className="dev-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dev-modal-head">
          <div className="dev-modal-title">DEV TOOLS</div>
          <button className="dev-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {!isAuthed ? (
          <div className="dev-auth-wrap">
            <div className="dev-auth-label">ENTER ADMIN PASSWORD</div>
            <input
              className="dev-auth-input"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="........"
              onKeyDown={(e) => e.key === "Enter" && onUnlock()}
              autoFocus
            />
            {authError && <div className="dev-auth-error">{authError}</div>}
            <button className="dev-action-btn" onClick={onUnlock}>
              UNLOCK
            </button>
          </div>
        ) : (
          <div className="dev-content">
            <div className="dev-tools-row">
              <button className="dev-action-btn" onClick={onAddLaptopCam} disabled={addCamLoading}>
                {addCamLoading ? "CONNECTING..." : "ADD LAPTOP_CAM"}
              </button>
              <button className="dev-action-btn" onClick={onSendTestNotif}>
                SEND TEST NOTIF
              </button>
            </div>
            {addCamMessage && <div className="dev-result">{addCamMessage}</div>}

            <div className="dev-section-title">VIDEO WALL LAYOUT</div>
            <div className="dev-layout-row">
              {[
                { value: "auto", label: "AUTO" },
                { value: "row", label: "ROW" },
                { value: "2x2", label: "2x2" },
                { value: "3x3", label: "3x3" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`dev-layout-btn${videoLayout === opt.value ? " active" : ""}`}
                  onClick={() => onVideoLayoutChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="dev-section-title">MODEL AND SITE PERFORMANCE SNAPSHOT</div>
            <div className="dev-chart-grid">
              <MiniTrendChart
                title="Accuracy"
                description="Share of all predictions classified correctly."
                points={accuracySeries}
                color="#0891b2"
                legendLabel="Accuracy trend"
              />
              <MiniTrendChart
                title="Precision"
                description="How many flagged positives were truly positive."
                points={precisionSeries}
                color="#16a34a"
                legendLabel="Precision trend"
              />
              <MiniTrendChart
                title="Recall"
                description="How many true positives were actually detected."
                points={recallSeries}
                color="#eab308"
                legendLabel="Recall trend"
              />
              <MiniTrendChart
                title="F1 Score"
                description="Balance between precision and recall."
                points={f1Series}
                color="#ef4444"
                legendLabel="F1 trend"
              />
            </div>

            <div className="dev-chart-grid dev-chart-grid-two">
              <MiniTrendChart
                title="Site Health"
                description="Synthetic site/runtime stability score."
                points={siteSeries}
                color="#166534"
                legendLabel="Health trend"
              />
              <div className="dev-chart-card">
                <div className="dev-chart-head">
                  <span>Confusion Matrix</span>
                  <strong>{latest ? new Date(latest.ts).toLocaleTimeString() : "--:--:--"}</strong>
                </div>
                <div className="dev-chart-desc">Current TP/FP/FN/TN from latest snapshot.</div>
                <div className="dev-matrix">
                  <div>TP: {latest?.confusion.tp ?? 0}</div>
                  <div>FP: {latest?.confusion.fp ?? 0}</div>
                  <div>FN: {latest?.confusion.fn ?? 0}</div>
                  <div>TN: {latest?.confusion.tn ?? 0}</div>
                </div>
                <div className="dev-legend">
                  <span className="dev-legend-item">
                    <span className="dev-legend-dot" style={{ background: "#16a34a" }} />TP true positive
                  </span>
                  <span className="dev-legend-item">
                    <span className="dev-legend-dot" style={{ background: "#ef4444" }} />FP false positive
                  </span>
                  <span className="dev-legend-item">
                    <span className="dev-legend-dot" style={{ background: "#eab308" }} />FN false negative
                  </span>
                  <span className="dev-legend-item">
                    <span className="dev-legend-dot" style={{ background: "#0891b2" }} />TN true negative
                  </span>
                </div>
              </div>
            </div>
            <div className="dev-note">Updates only when this Dev Tools modal is unlocked.</div>
          </div>
        )}
      </div>
    </div>
  );
}
