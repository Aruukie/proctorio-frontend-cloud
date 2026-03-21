const sessionGateStyles = `
  .gate-overlay {
    position: fixed;
    inset: 0;
    background: #dcfce7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    z-index: 1000;
    padding: 20px;
  }

  .gate-box {
    background: #f7fff9;
    border: 1px solid #86efac;
    width: 100%;
    max-width: 520px;
    padding: 26px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-radius: 16px;
    box-shadow: 0 20px 42px #1665342b;
    animation: gatePop 0.45s ease;
  }

  .gate-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #15803d;
  }

  .gate-title {
    font-size: 14px;
    letter-spacing: 0.08em;
    color: #14532d;
    font-weight: 700;
  }

  .gate-subtitle {
    font-size: 12px;
    color: #166534;
    letter-spacing: 0.01em;
    line-height: 1.5;
  }

  .gate-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .gate-tab {
    padding: 10px;
    font-size: 12px;
    letter-spacing: 0.04em;
    font-family: inherit;
    cursor: pointer;
    background: #ecfdf5;
    border: 1px solid #86efac;
    border-radius: 10px;
    color: #166534;
    transition: all 0.2s ease;
  }

  .gate-tab.active {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #f0fdf4;
    border-color: #16a34a;
    box-shadow: 0 10px 20px #15803d30;
  }

  .gate-tab:hover:not(.active) {
    border-color: #22c55e;
    background: #dcfce7;
  }

  .gate-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .gate-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .gate-label {
    font-size: 10px;
    letter-spacing: 0.08em;
    color: #16a34a;
    font-weight: 700;
  }

  .gate-id-row {
    display: flex;
    gap: 6px;
  }

  .gate-input {
    flex: 1;
    background: #ffffff;
    border: 1px solid #86efac;
    color: #14532d;
    padding: 10px 12px;
    font-size: 13px;
    font-family: inherit;
    letter-spacing: 0.01em;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    border-radius: 10px;
  }

  .gate-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px #22c55e24;
  }

  .gate-input::placeholder {
    color: #4ade80;
  }

  .gate-regen {
    background: #ecfdf5;
    border: 1px solid #86efac;
    color: #16a34a;
    width: 42px;
    font-size: 18px;
    cursor: pointer;
    border-radius: 10px;
    font-family: inherit;
    transition: all 0.2s;
  }

  .gate-regen:hover {
    border-color: #16a34a;
    background: #dcfce7;
  }

  .gate-error {
    font-size: 12px;
    color: #ef4444;
    letter-spacing: 0.02em;
  }

  .gate-btn {
    background: linear-gradient(135deg, #22c55e, #15803d);
    border: none;
    color: #f0fdf4;
    padding: 11px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.06em;
    font-family: inherit;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.2s ease;
    margin-top: 2px;
    border-radius: 10px;
    box-shadow: 0 12px 24px #1665342e;
  }

  .gate-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .gate-btn:disabled {
    opacity: 0.55;
    cursor: default;
    transform: none;
  }

  .gate-note {
    font-size: 11px;
    color: #15803d;
    letter-spacing: 0.02em;
    line-height: 1.5;
    border-top: 1px dashed #86efac;
    padding-top: 12px;
  }

  @keyframes gatePop {
    from { opacity: 0; transform: translateY(10px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const dashboardStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; min-height: 100%; overflow-x: hidden; }

  .app {
    --bg-0: #f0fdf4;
    --bg-1: #dcfce7;
    --bg-2: #bbf7d0;
    --panel: #f7fff9;
    --panel-2: #ffffff;
    --line: #86efac;
    --line-soft: #bbf7d0;
    --text-0: #14532d;
    --text-1: #166534;
    --text-2: #15803d;
    --green-strong: #16a34a;
    --green-accent: #22c55e;
    --alert: #ef4444;

    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100dvh;
    color: var(--text-0);
    font-family: "IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    background: var(--bg-0);
  }

  .app.alert-flash { animation: flashRed 0.55s ease; }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #f7fff9eb;
    border-bottom: 1px solid var(--line);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
    gap: 8px;
    flex-wrap: wrap;
    transition: border-color 0.3s;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 8px 22px #1665341a;
  }

  .topbar.alerted { border-bottom-color: #ef44448a; }
  .topbar-left  { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .topbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .brand {
    font-size: clamp(14px, 2vw, 16px);
    letter-spacing: 0.1em;
    color: var(--green-strong);
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .brand-sub {
    font-size: clamp(11px, 1.4vw, 12px);
    color: var(--text-2);
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .vdivider { width: 1px; height: 20px; background: var(--line); flex-shrink: 0; }

  .clock {
    font-size: clamp(11px, 1.5vw, 13px);
    color: var(--text-1);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .clock strong { color: var(--text-0); }

  .session-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #ecfdf5;
    border: 1px solid var(--line);
    padding: 4px 8px;
    font-size: 11px;
    letter-spacing: 0.03em;
    color: var(--text-2);
    white-space: nowrap;
    border-radius: 999px;
  }

  .session-chip strong { color: var(--green-strong); }

  .devtools-btn,
  .session-end-btn {
    background: #f0fdf4;
    border: 1px solid var(--line);
    color: var(--text-2);
    padding: 4px 8px;
    font-size: 10px;
    letter-spacing: 0.05em;
    cursor: pointer;
    font-family: inherit;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .devtools-btn:hover { border-color: #0891b2; color: #0891b2; }
  .session-end-btn:hover { border-color: var(--alert); color: var(--alert); background: #fef2f2; }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 9px;
    border: 1px solid;
    border-radius: 999px;
    font-size: clamp(10px, 1.2vw, 12px);
    letter-spacing: 0.06em;
    font-weight: 700;
    white-space: nowrap;
    background: #ffffffc7;
  }

  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .alert-banner {
    background: linear-gradient(90deg, #fef2f2 0%, #fff7ed 100%);
    border-bottom: 1px solid #ef44445b;
    padding: 7px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    animation: slideDown 0.3s ease;
    position: sticky;
    top: 56px;
    z-index: 99;
  }

  .alert-banner-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: clamp(11px, 1.3vw, 13px);
    color: var(--alert);
    letter-spacing: 0.05em;
    font-weight: 800;
  }

  .ticker-wrap {
    padding: 4px 14px;
    background: #ecfdf5;
    border-bottom: 1px solid var(--line-soft);
    overflow: hidden;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ticker-inner {
    display: inline-block;
    animation: ticker 32s linear infinite;
    color: var(--text-2);
    font-size: clamp(10px, 1.2vw, 12px);
    letter-spacing: 0.05em;
  }

  .main { flex: 1; display: grid; grid-template-columns: 1fr 336px; gap: 10px; padding: 10px; }

  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .video-section,
  .cam-panel,
  .cam-metrics-stats,
  .sidebar,
  .video-modal,
  .dev-modal {
    background: #f7fff9de;
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: 0 14px 26px #16653417;
  }

  .video-section { padding: 10px; }

  .video-wrap {
    position: relative;
    background: #0f172a;
    border: 1px solid var(--line-soft);
    overflow: hidden;
    border-radius: 10px;
    transition: border-color 0.3s, box-shadow 0.4s;
    aspect-ratio: 16 / 9;
    width: 100%;
  }

  .video-wrap.alerted {
    border-color: var(--alert);
    box-shadow: 0 0 22px #ef44443a, inset 0 0 20px #ef444410;
    animation: borderPulse 1s ease-in-out infinite;
  }

  .video-feed { width: 100%; height: 100%; display: block; object-fit: contain; transition: opacity 0.45s; position: absolute; inset: 0; }

  .scan-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(transparent, #22c55e40, transparent);
    animation: scan 4s linear infinite;
    z-index: 5;
    pointer-events: none;
  }

  .video-labels { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 5px; z-index: 10; }

  .video-label {
    background: #03140cd2;
    border: 1px solid #4ade80;
    padding: 3px 7px;
    border-radius: 999px;
    font-size: 10px;
    letter-spacing: 0.04em;
    color: #86efac;
  }

  .rec-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 8; border: 2px solid transparent; transition: border-color 0.3s; }
  .rec-overlay.active { border-color: #ef44446b; animation: borderPulse 1s ease-in-out infinite; }

  .no-feed {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #fecaca;
    text-align: center;
    padding: 18px;
    background: linear-gradient(160deg, #1e293be6 0%, #0f172ad6 100%);
  }

  .retry-btn {
    background: #ef44441a;
    border: 1px solid #ef4444;
    color: #fecaca;
    padding: 6px 12px;
    font-size: 11px;
    letter-spacing: 0.05em;
    cursor: pointer;
    font-family: inherit;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .retry-btn:hover { background: #ef444436; }

  .section-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--green-strong);
    text-transform: uppercase;
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
  }

  .poll-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-accent); animation: blink 2s ease-in-out infinite; display: inline-block; }

  .metric-box {
    background: var(--panel-2);
    border: 1px solid var(--line-soft);
    border-radius: 10px;
    padding: 9px 10px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: relative;
    overflow: hidden;
  }

  .metric-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
  .metric-label { font-size: 10px; letter-spacing: 0.08em; color: var(--text-2); }
  .metric-value { font-size: clamp(18px, 2.1vw, 24px); font-weight: 800; color: var(--text-0); line-height: 1.08; }
  .metric-sub { font-size: 11px; color: var(--text-1); }

  .cam-panel { padding: 10px; }

  .cam-panel-header {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--green-strong);
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
  }

  .cam-scan-btn {
    background: #f0fdf4;
    border: 1px solid var(--line-soft);
    color: var(--text-2);
    padding: 3px 8px;
    font-size: 10px;
    letter-spacing: 0.04em;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: all 0.2s;
    border-radius: 8px;
  }

  .cam-scan-btn:hover:not(:disabled) {
    border-color: var(--green-strong);
    color: var(--green-strong);
    background: #dcfce7;
  }

  .cam-add-form {
    background: #ecfdf5;
    border: 1px solid var(--line-soft);
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 7px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    animation: fadeIn 0.2s ease;
  }

  .cam-add-label { font-size: 10px; letter-spacing: 0.06em; color: var(--text-2); }

  .cam-add-input {
    background: #ffffff;
    border: 1px solid var(--line-soft);
    color: var(--text-0);
    padding: 8px 9px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    border-radius: 8px;
  }

  .cam-add-input:focus { border-color: var(--green-strong); box-shadow: 0 0 0 3px #16a34a1f; }
  .cam-add-input::placeholder { color: #4ade80; }

  .cam-add-btn {
    margin-top: 7px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    color: #f0fdf4;
    padding: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    font-family: inherit;
    cursor: pointer;
    transition: transform 0.15s;
    border-radius: 8px;
  }

  .cam-add-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .cam-add-btn:disabled { opacity: 0.5; cursor: default; }

  .cam-list { display: flex; flex-direction: column; gap: 5px; }

  .cam-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 9px;
    border: 1px solid var(--line-soft);
    border-radius: 9px;
    background: #f7fff9;
    transition: border-color 0.2s, transform 0.15s;
  }

  .cam-item:hover:not(.cam-active) { border-color: #4ade80; transform: translateY(-1px); }
  .cam-active { border-color: var(--green-strong) !important; box-shadow: 0 0 0 1px #16a34a2f; }

  .cam-item-left { display: flex; align-items: center; gap: 8px; }
  .cam-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .cam-id { font-size: 12px; font-weight: 700; color: var(--text-0); letter-spacing: 0.03em; }
  .cam-meta { font-size: 10px; color: var(--text-2); }
  .cam-active-badge { font-size: 10px; color: var(--green-strong); letter-spacing: 0.05em; font-weight: 700; }
  .cam-err-badge { font-size: 10px; color: var(--alert); letter-spacing: 0.05em; }
  .cam-empty { display: flex; align-items: center; gap: 7px; padding: 8px 0; font-size: 11px; color: var(--text-2); letter-spacing: 0.04em; }
  .cam-error { font-size: 11px; color: var(--alert); margin-bottom: 6px; }

  .cam-metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: stretch; }
  .cam-metrics-cam { min-width: 0; }
  .cam-metrics-stats { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 10px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .uptime-chip { font-size: clamp(11px, 1.3vw, 13px); color: var(--green-strong); font-weight: 700; letter-spacing: 0.03em; }

  .video-wall-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 8px; width: 100%; }
  .video-wall-grid.layout-auto { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .video-wall-grid.layout-row { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .video-wall-grid.layout-2x2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .video-wall-grid.layout-3x3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  .video-wall-empty {
    aspect-ratio: 16/9;
    background: linear-gradient(160deg, #ecfdf5, #dcfce7);
    border: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px #f7fff9;
  }

  .video-tile {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #f7fff9;
    border: 1px solid var(--line-soft);
    border-radius: 10px;
    padding: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .video-tile.viewing { border-color: var(--green-strong); box-shadow: 0 0 0 1px #16a34a2c; }
  .video-tile-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .video-tile-title { font-size: 11px; letter-spacing: 0.08em; color: var(--text-1); font-weight: 700; }
  .video-tile-actions { display: flex; align-items: center; gap: 5px; }

  .video-tile-rec {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    letter-spacing: 0.04em;
    color: var(--alert);
    border: 1px solid #ef444462;
    border-radius: 999px;
    padding: 2px 7px;
    background: #fef2f2;
  }

  .video-expand-btn {
    background: #ecfdf5;
    border: 1px solid #86efac;
    color: var(--text-2);
    padding: 2px 6px;
    font-size: 9px;
    letter-spacing: 0.04em;
    font-family: inherit;
    cursor: pointer;
    border-radius: 7px;
  }

  .video-expand-btn:hover { border-color: #0891b2; color: #0891b2; }
  .video-tile-stream { aspect-ratio: 16/9; cursor: zoom-in; }

  .video-modal-backdrop { position: fixed; inset: 0; z-index: 9997; background: #052e169c; display: flex; align-items: center; justify-content: center; padding: 14px; }

  .video-modal {
    width: min(1100px, 100%);
    max-height: 90dvh;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #f7fff9;
    padding: 10px;
  }

  .video-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--line-soft); padding-bottom: 7px; }
  .video-modal-title { font-size: 12px; letter-spacing: 0.06em; color: var(--text-1); font-weight: 700; }

  .video-modal-close-btn {
    background: #f0fdf4;
    border: 1px solid var(--line);
    color: var(--text-2);
    padding: 3px 8px;
    font-size: 10px;
    letter-spacing: 0.05em;
    cursor: pointer;
    font-family: inherit;
    border-radius: 8px;
  }

  .video-modal-close-btn:hover { border-color: var(--alert); color: var(--alert); }
  .video-modal-stream { aspect-ratio: 16/9; width: 100%; }

  .dev-modal-backdrop { position: fixed; inset: 0; background: #052e1685; z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 14px; }

  .dev-modal {
    width: min(920px, 100%);
    max-height: 88dvh;
    overflow-y: auto;
    background: #f7fff9;
    padding: 12px;
  }

  .dev-modal-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line-soft); padding-bottom: 8px; margin-bottom: 9px; }
  .dev-modal-title { font-size: 12px; letter-spacing: 0.07em; color: var(--text-1); font-weight: 700; }

  .dev-close-btn {
    background: #ecfdf5;
    border: 1px solid var(--line);
    color: var(--text-2);
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 7px;
    cursor: pointer;
  }

  .dev-auth-wrap { display: flex; flex-direction: column; gap: 8px; max-width: 340px; margin: 18px auto 14px; width: 100%; text-align: center; }
  .dev-auth-label { font-size: 10px; letter-spacing: 0.06em; color: var(--text-2); }
  .dev-auth-input { background: #ffffff; border: 1px solid var(--line-soft); color: var(--text-0); padding: 8px 10px; font-size: 12px; font-family: inherit; outline: none; border-radius: 8px; }
  .dev-auth-input:focus { border-color: var(--green-strong); box-shadow: 0 0 0 3px #16a34a20; }
  .dev-auth-error { color: var(--alert); font-size: 11px; }

  .dev-action-btn {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    color: #f0fdf4;
    padding: 7px 10px;
    font-size: 10px;
    letter-spacing: 0.06em;
    cursor: pointer;
    font-family: inherit;
    border-radius: 8px;
    transition: transform 0.15s;
  }

  .dev-action-btn:disabled { opacity: 0.55; cursor: default; }
  .dev-action-btn:hover:not(:disabled) { transform: translateY(-1px); }

  .dev-content { display: flex; flex-direction: column; gap: 9px; }
  .dev-tools-row { display: flex; flex-wrap: wrap; gap: 7px; }
  .dev-push-test-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 7px; }
  .dev-inline-input {
    width: 100%;
    background: #ffffff;
    border: 1px solid var(--line-soft);
    color: var(--text-0);
    padding: 7px 9px;
    font-size: 11px;
    font-family: inherit;
    border-radius: 8px;
    outline: none;
  }
  .dev-inline-input:focus { border-color: var(--green-strong); box-shadow: 0 0 0 3px #16a34a20; }
  .dev-push-meta { font-size: 10px; color: var(--text-2); letter-spacing: 0.02em; }
  .dev-layout-row { display: flex; flex-wrap: wrap; gap: 6px; }

  .dev-layout-btn {
    background: #ecfdf5;
    border: 1px solid var(--line-soft);
    color: var(--text-2);
    padding: 5px 8px;
    font-size: 10px;
    letter-spacing: 0.04em;
    cursor: pointer;
    font-family: inherit;
    border-radius: 7px;
  }

  .dev-layout-btn.active { border-color: var(--green-strong); color: var(--green-strong); background: #dcfce7; }
  .dev-result { font-size: 11px; color: var(--text-2); letter-spacing: 0.02em; }
  .dev-section-title { font-size: 10px; letter-spacing: 0.08em; color: var(--green-strong); margin-top: 2px; }
  .dev-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .dev-chart-grid-two { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .dev-chart-card {
    border: 1px solid var(--line-soft);
    border-radius: 10px;
    background: #ffffff;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dev-chart-head { display: flex; justify-content: space-between; align-items: baseline; font-size: 10px; letter-spacing: 0.05em; color: var(--green-strong); }
  .dev-chart-head strong { font-size: 11px; color: var(--text-0); letter-spacing: 0.03em; }
  .dev-chart-desc { font-size: 10px; color: var(--text-2); letter-spacing: 0.02em; line-height: 1.4; min-height: 18px; }
  .dev-chart-svg { width: 100%; height: 84px; border: 1px solid var(--line-soft); border-radius: 8px; }
  .dev-legend { display: flex; flex-wrap: wrap; gap: 8px; }
  .dev-legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; color: var(--text-2); letter-spacing: 0.01em; }
  .dev-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dev-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: var(--text-1); letter-spacing: 0.01em; }
  .dev-matrix > div { border: 1px solid var(--line-soft); border-radius: 8px; background: #f0fdf4; padding: 8px; text-align: center; }
  .dev-note { font-size: 10px; color: var(--text-2); letter-spacing: 0.02em; }

  @media (max-width: 760px) {
    .dev-push-test-row { grid-template-columns: 1fr; }
  }

  .sidebar {
    border: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    background: #f7fff9de;
    transition: border-color 0.3s;
    position: sticky;
    top: 10px;
    height: calc(100dvh - 20px);
    overflow: hidden;
  }

  .sidebar.alerted { border-color: #ef44446e; }
  .sidebar-header { padding: 10px 12px 8px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
  .sidebar-title { font-size: 10px; letter-spacing: 0.1em; color: var(--green-strong); text-transform: uppercase; display: flex; align-items: center; gap: 7px; font-weight: 700; }
  .unified-feed { flex: 1; overflow-y: auto; padding: 9px 12px; }

  .incident-block { border-bottom: 1px solid var(--line-soft); margin-bottom: 3px; }
  .incident-header { display: flex; align-items: center; gap: 8px; padding: 8px 0; transition: background 0.15s; border-radius: 8px; }
  .incident-header:hover { background: #ecfdf5; padding-left: 4px; padding-right: 4px; }
  .incident-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .incident-type { font-size: 12px; font-weight: 700; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .incident-meta { font-size: 10px; color: var(--text-2); }
  .incident-ago { font-size: 10px; color: var(--green-strong); white-space: nowrap; }
  .ack-done { font-size: 10px; color: var(--green-strong); }

  .acknowledge-btn {
    width: 100%;
    margin-top: 8px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    color: #f0fdf4;
    padding: 8px;
    font-size: 11px;
    letter-spacing: 0.06em;
    cursor: pointer;
    font-family: inherit;
    border-radius: 8px;
    transition: transform 0.15s;
  }

  .acknowledge-btn:hover { transform: translateY(-1px); }
  .incident-clip { padding: 0 0 9px 14px; animation: fadeIn 0.3s ease; }

  .standalone-rec-block { border-bottom: 1px solid var(--line-soft); padding: 7px 0; }

  .rec-card {
    border: 1px solid var(--line-soft);
    background: #ffffff;
    margin-bottom: 0;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.3s;
  }

  .rec-card-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; gap: 8px; }
  .rec-card-header:hover { background: #ecfdf5; }
  .rec-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #ef4444; animation: blink 0.7s step-end infinite; flex-shrink: 0; box-shadow: 0 0 8px #ef4444; }
  .rec-type { font-size: 12px; font-weight: 700; color: var(--text-1); letter-spacing: 0.03em; }
  .rec-meta { font-size: 10px; color: var(--text-2); }
  .rec-player { padding: 0 10px 10px; }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 88px;
    gap: 7px;
    color: #4ade80;
    font-size: 11px;
    letter-spacing: 0.06em;
  }

  .sidebar-footer { border-top: 1px solid var(--line-soft); padding: 8px 12px; background: #ecfdf5; flex-shrink: 0; }
  .endpoint-label { font-size: 9px; color: var(--text-2); letter-spacing: 0.04em; }
  .endpoint-box { background: #ffffff; border: 1px solid var(--line-soft); border-radius: 8px; padding: 4px 7px; font-size: 10px; color: var(--text-1); letter-spacing: 0.02em; word-break: break-all; margin-top: 3px; }
  .tech-stack { margin-top: 6px; font-size: 9px; color: var(--text-2); letter-spacing: 0.02em; line-height: 1.5; }
  .tab-badge { background: #ef4444; color: #ffffff; border-radius: 999px; padding: 2px 6px; font-size: 9px; font-weight: 700; letter-spacing: 0.03em; animation: blink 1.5s step-end infinite; }

  @keyframes blink { 50% { opacity: 0.25; } }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(700%); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes flashRed { 0%,100% { filter: saturate(1); } 30%,70% { filter: saturate(1.2); } }
  @keyframes borderPulse { 0%,100% { box-shadow: 0 0 14px #ef44442f; } 50% { box-shadow: 0 0 26px #ef444452; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f7fff9; }
  ::-webkit-scrollbar-thumb { background: #86efac; border-radius: 20px; }

  @media (max-width: 1080px) {
    .main { grid-template-columns: 1fr; }
    .sidebar { position: static; top: 0; height: auto; max-height: 430px; }
    .cam-metrics-row { grid-template-columns: 1fr; }
    .video-wall-grid.layout-3x3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 740px) {
    .main { padding: 8px; gap: 8px; }
    .topbar { padding: 9px 10px; }
    .brand-sub { display: none; }
    .left-panel { gap: 8px; }
    .clock { display: none; }
    .video-wall-grid,
    .video-wall-grid.layout-2x2,
    .video-wall-grid.layout-3x3,
    .video-wall-grid.layout-row,
    .video-wall-grid.layout-auto { grid-template-columns: 1fr; }
    .dev-chart-grid,
    .dev-chart-grid-two { grid-template-columns: 1fr; }
  }
`;

export { sessionGateStyles, dashboardStyles };
