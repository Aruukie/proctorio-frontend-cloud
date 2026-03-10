const sessionGateStyles = `
  .gate-overlay {
    position: fixed; inset: 0; background: #f0fdf4;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Courier New', monospace; z-index: 1000; padding: 16px;
  }
  .gate-box {
    background: #fffffffff; border: 1px solid #bbf7d0;
    width: 100%; max-width: 440px; padding: 32px 28px;
    display: flex; flex-direction: column; gap: 16px;
    animation: fadeIn .4s ease;
  }
  .gate-logo {
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 900; letter-spacing: .28em; color: #16a34a;
  }
  .gate-title {
    font-size: 11px; letter-spacing: .22em; color: #14532d; font-weight: 700;
  }
  .gate-subtitle {
    font-size: 9px; color: #16a34a; letter-spacing: .07em; line-height: 1.7;
  }
  .gate-tabs {
    display: flex; border: 1px solid #bbf7d0;
  }
  .gate-tab {
    flex: 1; padding: 8px; font-size: 9px; letter-spacing: .14em;
    font-family: 'Courier New', monospace; cursor: pointer;
    background: transparent; border: none; color: #16a34a; transition: all .2s;
  }
  .gate-tab:first-child { border-right: 1px solid #bbf7d0; }
  .gate-tab.active { background: #d1fae5; color: #16a34a; }
  .gate-tab:hover:not(.active) { color: #166534; }
  .gate-fields { display: flex; flex-direction: column; gap: 12px; }
  .gate-field  { display: flex; flex-direction: column; gap: 5px; }
  .gate-label  { font-size: 8px; letter-spacing: .16em; color: #16a34a; }
  .gate-id-row { display: flex; gap: 6px; }
  .gate-input {
    flex: 1; background: #f7fef9; border: 1px solid #bbf7d0; color: #14532d;
    padding: 9px 11px; font-size: 11px; font-family: 'Courier New', monospace;
    letter-spacing: .06em; outline: none; transition: border-color .2s;
  }
  .gate-input:focus { border-color: #16a34a; }
  .gate-input::placeholder { color: #4ade80; }
  .gate-regen {
    background: transparent; border: 1px solid #bbf7d0; color: #16a34a;
    padding: 0 10px; font-size: 14px; cursor: pointer;
    font-family: 'Courier New', monospace; transition: border-color .2s, color .2s;
  }
  .gate-regen:hover { border-color: #16a34a; color: #16a34a; }
  .gate-error { font-size: 9px; color: #ef4444; letter-spacing: .08em; }
  .gate-btn {
    background: #16a34a; border: none; color: #ffffff;
    padding: 11px; font-size: 11px; font-weight: 900; letter-spacing: .18em;
    font-family: 'Courier New', monospace; cursor: pointer;
    transition: background .2s; margin-top: 4px;
  }
  .gate-btn:hover:not(:disabled) { background: #16a34a; }
  .gate-btn:disabled { opacity: .5; cursor: default; }
  .gate-note {
    font-size: 8px; color: #4ade80; letter-spacing: .07em; line-height: 1.7;
    border-top: 1px solid #bbf7d0; padding-top: 12px;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
`;

const dashboardStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; min-height: 100%; overflow-x: hidden; }

  .app { display: flex; flex-direction: column; width: 100%; min-height: 100dvh; background: #f0fdf4; color: #14532d; font-family: 'Courier New', monospace; }
  .app.alert-flash { animation: flashRed .6s ease; }

  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; background: #fffffffff; border-bottom: 1px solid #bbf7d0; flex-shrink: 0; gap: 8px; flex-wrap: wrap; transition: border-color .3s; position: sticky; top: 0; z-index: 100; }
  .topbar.alerted { border-bottom-color: #ef444460; }
  .topbar-left  { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .brand { font-size: clamp(11px,2vw,13px); letter-spacing: .28em; color: #16a34a; font-weight: 900; display: flex; align-items: center; gap: 7px; white-space: nowrap; }
  .brand-sub { font-size: clamp(8px,1.2vw,10px); color: #16a34a; letter-spacing: .14em; white-space: nowrap; }
  .vdivider  { width: 1px; height: 18px; background: #bbf7d0; flex-shrink: 0; }
  .clock     { font-size: clamp(9px,1.5vw,12px); color: #166534; letter-spacing: .07em; white-space: nowrap; }
  .clock strong { color: #14532d; }
  .session-chip { display: flex; align-items: center; gap: 6px; background: #fffffffff; border: 1px solid #bbf7d0; padding: 3px 8px; font-size: 9px; letter-spacing: .1em; color: #15803d; white-space: nowrap; }
  .session-chip strong { color: #16a34a; }
  .devtools-btn { background: transparent; border: 1px solid #0891b260; color: #0891b2; padding: 2px 7px; font-size: 8px; letter-spacing: .1em; cursor: pointer; font-family: 'Courier New', monospace; transition: border-color .2s, color .2s; }
  .devtools-btn:hover { border-color: #0891b2; color: #0e7490; }
  .session-end-btn { background: transparent; border: 1px solid #4ade80; color: #16a34a; padding: 2px 7px; font-size: 8px; letter-spacing: .1em; cursor: pointer; font-family: 'Courier New', monospace; transition: border-color .2s, color .2s; }
  .session-end-btn:hover { border-color: #ef4444; color: #ef4444; }

  .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid; border-radius: 2px; font-size: clamp(8px,1.2vw,10px); letter-spacing: .12em; font-weight: 700; white-space: nowrap; }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  .alert-banner { background: #fef2f2; border-bottom: 1px solid #ef444450; padding: 6px 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; animation: slideDown .3s ease; position: sticky; top: 42px; z-index: 99; }
  .alert-banner-text { display: flex; align-items: center; gap: 10px; font-size: clamp(9px,1.3vw,11px); color: #ef4444; letter-spacing: .14em; font-weight: 700; }

  .ticker-wrap  { padding: 4px 16px; background: #ecfdf5; border-bottom: 1px solid #d1fae5; overflow: hidden; white-space: nowrap; flex-shrink: 0; }
  .ticker-inner { display: inline-block; animation: ticker 32s linear infinite; color: #16a34a; font-size: clamp(8px,1.2vw,10px); letter-spacing: .1em; }

  .main { flex: 1; display: grid; grid-template-columns: 1fr 300px; }
  .left-panel { display: flex; flex-direction: column; gap: 10px; padding: 12px 12px 12px 16px; min-width: 0; }
  .video-section { display: flex; flex-direction: column; width: 100%; }
  .video-wrap { position: relative; background: #0f172a; border: 1px solid #bbf7d0; overflow: hidden; border-radius: 2px; transition: border-color .3s, box-shadow .4s; aspect-ratio: 16/9; width: 100%; }
  .video-wrap.alerted { border-color: #ef4444; box-shadow: 0 0 20px #ef444425, inset 0 0 30px #ef444408; animation: borderPulse 1s ease-in-out infinite; }
  .video-feed { width: 100%; height: 100%; display: block; object-fit: contain; transition: opacity .5s; position: absolute; inset: 0; }
  .scan-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(transparent, rgba(22,163,74,.15), transparent); animation: scan 4s linear infinite; z-index: 5; pointer-events: none; }
  .video-labels { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 5px; z-index: 10; }
  .video-label { background: rgba(0,0,0,.75); border: 1px solid #bbf7d0; padding: 2px 6px; font-size: 8px; letter-spacing: .1em; color: #15803d; }
  .rec-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 8; border: 2px solid transparent; transition: border-color .3s; }
  .rec-overlay.active { border-color: #ef444460; animation: borderPulse 1s ease-in-out infinite; }
  .no-feed { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #ef4444; text-align: center; padding: 20px; }
  .retry-btn { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 5px 14px; font-size: 9px; letter-spacing: .15em; cursor: pointer; font-family: 'Courier New', monospace; transition: background .2s; }
  .retry-btn:hover { background: #ef444415; }

  .section-label { font-size: 8px; letter-spacing: .22em; color: #16a34a; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
  .poll-dot { width: 5px; height: 5px; border-radius: 50%; background: #16a34a; animation: blink 2s ease-in-out infinite; display: inline-block; }

  .metric-box { background: #fffffffff; border: 1px solid #bbf7d0; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; position: relative; overflow: hidden; }
  .metric-accent { position: absolute; top: 0; left: 0; width: 3px; height: 100%; }
  .metric-label  { font-size: 7px; letter-spacing: .18em; color: #16a34a; }
  .metric-value  { font-size: clamp(14px,2vw,19px); font-weight: 800; color: #14532d; line-height: 1; }
  .metric-sub    { font-size: 8px; color: #15803d; }

  .cam-panel { background: #fffffffff; border: 1px solid #bbf7d0; padding: 10px; }
  .cam-panel-header { font-size: 8px; letter-spacing: .22em; color: #16a34a; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .cam-scan-btn { background: transparent; border: 1px solid #bbf7d0; color: #16a34a; padding: 3px 8px; font-size: 8px; letter-spacing: .1em; cursor: pointer; font-family: 'Courier New', monospace; white-space: nowrap; transition: border-color .2s, color .2s; }
  .cam-scan-btn:hover:not(:disabled) { border-color: #16a34a; color: #16a34a; }
  .cam-add-form { background: #f7fef9; border: 1px solid #bbf7d0; padding: 10px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px; animation: fadeIn .2s ease; }
  .cam-add-label { font-size: 7px; letter-spacing: .16em; color: #16a34a; }
  .cam-add-input { background: #fffffffff; border: 1px solid #bbf7d0; color: #14532d; padding: 7px 9px; font-size: 10px; font-family: 'Courier New', monospace; outline: none; transition: border-color .2s; width: 100%; }
  .cam-add-input:focus { border-color: #16a34a; }
  .cam-add-input::placeholder { color: #4ade80; }
  .cam-add-btn { margin-top: 8px; background: transparent; border: 1px solid #16a34a; color: #16a34a; padding: 7px; font-size: 9px; font-weight: 700; letter-spacing: .14em; font-family: 'Courier New', monospace; cursor: pointer; transition: background .2s; }
  .cam-add-btn:hover:not(:disabled) { background: #16a34a18; }
  .cam-add-btn:disabled { opacity: .4; cursor: default; }
  .cam-list { display: flex; flex-direction: column; gap: 4px; }
  .cam-item { display: flex; align-items: center; justify-content: space-between; padding: 7px 9px; border: 1px solid #bbf7d0; background: #f7fef9; transition: border-color .2s; }
  .cam-item:hover:not(.cam-active) { border-color: #4ade80; }
  .cam-active { border-color: #16a34a !important; }
  .cam-item-left { display: flex; align-items: center; gap: 8px; }
  .cam-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .cam-id   { font-size: 10px; font-weight: 700; color: #14532d; letter-spacing: .06em; }
  .cam-meta { font-size: 8px; color: #4ade80; }
  .cam-active-badge  { font-size: 8px; color: #16a34a; letter-spacing: .1em; font-weight: 700; }
  .cam-err-badge { font-size: 8px; color: #ef4444; letter-spacing: .1em; }
  .cam-empty { display: flex; align-items: center; gap: 7px; padding: 10px 0; font-size: 9px; color: #4ade80; letter-spacing: .08em; }
  .cam-error { font-size: 9px; color: #ef4444; margin-bottom: 6px; }

  .cam-metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start; }
  .cam-metrics-cam  { min-width: 0; }
  .cam-metrics-stats { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 6px; }
  .uptime-chip { font-size: clamp(9px,1.2vw,11px); color: #16a34a; font-weight: 700; letter-spacing: .1em; }

  .video-wall-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 8px; width: 100%; }
  .video-wall-grid.layout-auto { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .video-wall-grid.layout-row { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .video-wall-grid.layout-2x2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .video-wall-grid.layout-3x3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .video-wall-empty { aspect-ratio: 16/9; background: #ecfdf5; border: 1px solid #bbf7d0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-radius: 2px; }
  .video-tile { display: flex; flex-direction: column; gap: 6px; background: #ffffff; border: 1px solid #bbf7d0; padding: 6px; transition: border-color .2s, box-shadow .2s; }
  .video-tile.viewing { border-color: #16a34a; box-shadow: 0 0 0 1px #16a34a30; }
  .video-tile-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .video-tile-title { font-size: 9px; letter-spacing: .12em; color: #166534; font-weight: 700; }
  .video-tile-actions { display: flex; align-items: center; gap: 6px; }
  .video-tile-rec { display: inline-flex; align-items: center; gap: 5px; font-size: 8px; letter-spacing: .1em; color: #ef4444; border: 1px solid #ef444470; padding: 2px 6px; background: #fef2f2; }
  .video-expand-btn { background: transparent; border: 1px solid #0891b260; color: #0891b2; padding: 1px 5px; font-size: 7px; letter-spacing: .1em; font-family: 'Courier New', monospace; cursor: pointer; }
  .video-expand-btn:hover { border-color: #0891b2; color: #0e7490; }
  .video-tile-stream { aspect-ratio: 16/9; cursor: zoom-in; }
  .video-modal-backdrop { position: fixed; inset: 0; z-index: 9997; background: #0f172ab3; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .video-modal { width: min(1100px, 100%); max-height: 90dvh; display: flex; flex-direction: column; gap: 8px; background: #ffffff; border: 1px solid #bbf7d0; padding: 10px; border-radius: 2px; }
  .video-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #d1fae5; padding-bottom: 6px; }
  .video-modal-title { font-size: 10px; letter-spacing: .14em; color: #166534; font-weight: 700; }
  .video-modal-close-btn { background: transparent; border: 1px solid #bbf7d0; color: #16a34a; padding: 3px 8px; font-size: 8px; letter-spacing: .1em; cursor: pointer; font-family: 'Courier New', monospace; }
  .video-modal-close-btn:hover { border-color: #ef4444; color: #ef4444; }
  .video-modal-stream { aspect-ratio: 16/9; width: 100%; }

  .dev-modal-backdrop { position: fixed; inset: 0; background: #0f172a88; z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .dev-modal { width: min(920px, 100%); max-height: 88dvh; overflow-y: auto; background: #ffffff; border: 1px solid #bbf7d0; border-radius: 2px; padding: 12px; }
  .dev-modal-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #d1fae5; padding-bottom: 8px; margin-bottom: 10px; }
  .dev-modal-title { font-size: 10px; letter-spacing: .18em; color: #166534; font-weight: 700; }
  .dev-close-btn { background: transparent; border: 1px solid #bbf7d0; color: #16a34a; font-size: 10px; padding: 2px 8px; cursor: pointer; }
  .dev-auth-wrap { display: flex; flex-direction: column; gap: 8px; max-width: 320px; margin: 24px auto 18px; width: 100%; text-align: center; }
  .dev-auth-label { font-size: 8px; letter-spacing: .14em; color: #16a34a; }
  .dev-auth-input { background: #f7fef9; border: 1px solid #bbf7d0; color: #14532d; padding: 8px 10px; font-size: 10px; font-family: 'Courier New', monospace; outline: none; }
  .dev-auth-input:focus { border-color: #16a34a; }
  .dev-auth-error { color: #ef4444; font-size: 9px; }
  .dev-action-btn { background: transparent; border: 1px solid #16a34a; color: #16a34a; padding: 7px 10px; font-size: 9px; letter-spacing: .12em; cursor: pointer; font-family: 'Courier New', monospace; }
  .dev-action-btn:disabled { opacity: .5; cursor: default; }
  .dev-content { display: flex; flex-direction: column; gap: 10px; }
  .dev-tools-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .dev-layout-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .dev-layout-btn { background: transparent; border: 1px solid #bbf7d0; color: #15803d; padding: 5px 8px; font-size: 8px; letter-spacing: .12em; cursor: pointer; font-family: 'Courier New', monospace; }
  .dev-layout-btn.active { border-color: #16a34a; color: #16a34a; background: #ecfdf5; }
  .dev-result { font-size: 9px; color: #15803d; letter-spacing: .08em; }
  .dev-section-title { font-size: 8px; letter-spacing: .18em; color: #16a34a; margin-top: 2px; }
  .dev-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .dev-chart-grid-two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dev-chart-card { border: 1px solid #bbf7d0; background: #ffffff; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
  .dev-chart-head { display: flex; justify-content: space-between; align-items: baseline; font-size: 8px; letter-spacing: .11em; color: #16a34a; }
  .dev-chart-head strong { font-size: 9px; color: #14532d; letter-spacing: .06em; }
  .dev-chart-desc { font-size: 8px; color: #4ade80; letter-spacing: .06em; line-height: 1.5; min-height: 18px; }
  .dev-chart-svg { width: 100%; height: 80px; border: 1px solid #d1fae5; }
  .dev-legend { display: flex; flex-wrap: wrap; gap: 8px; }
  .dev-legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 8px; color: #15803d; letter-spacing: .05em; }
  .dev-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dev-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; color: #166534; letter-spacing: .05em; }
  .dev-matrix > div { border: 1px solid #d1fae5; background: #f7fef9; padding: 8px; text-align: center; }
  .dev-note { font-size: 8px; color: #4ade80; letter-spacing: .08em; }

  .sidebar { border-left: 1px solid #86efac; display: flex; flex-direction: column; background: #f8fffe; transition: border-color .3s; position: sticky; top: 0; height: 100dvh; overflow: hidden; }
  .sidebar.alerted { border-left-color: #ef444440; }
  .sidebar-header { padding: 10px 13px 8px; border-bottom: 1px solid #d1fae5; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
  .sidebar-title { font-size: 8px; letter-spacing: .22em; color: #16a34a; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
  .unified-feed { flex: 1; overflow-y: auto; padding: 10px 13px; }

  .incident-block { border-bottom: 1px solid #d1fae5; margin-bottom: 2px; }
  .incident-header { display: flex; align-items: center; gap: 8px; padding: 9px 0; transition: background .15s; border-radius: 2px; }
  .incident-header:hover { background: #fffffffff; padding-left: 4px; padding-right: 4px; }
  .incident-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .incident-type { font-size: 10px; font-weight: 700; letter-spacing: .06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .incident-meta { font-size: 8px; color: #4ade80; }
  .incident-ago  { font-size: 8px; color: #16a34a; white-space: nowrap; }
  .ack-done { font-size: 8px; color: #16a34a; }
  .acknowledge-btn { width: 100%; margin-top: 8px; background: transparent; border: 1px solid #16a34a40; color: #16a34a; padding: 9px; font-size: 10px; letter-spacing: .18em; cursor: pointer; font-family: 'Courier New', monospace; transition: background .2s, border-color .2s; }
  .acknowledge-btn:hover { background: #16a34a15; border-color: #16a34a; }
  .incident-clip { padding: 0 0 10px 16px; animation: fadeIn .3s ease; }

  .standalone-rec-block { border-bottom: 1px solid #d1fae5; padding: 8px 0; }
  .rec-card { border: 1px solid #bbf7d0; background: #fffffffff; margin-bottom: 0; border-radius: 2px; overflow: hidden; transition: border-color .3s; }
  .rec-card-header { display: flex; align-items: center; justify-content: space-between; padding: 9px 10px; gap: 8px; }
  .rec-card-header:hover { background: #d1fae5; }
  .rec-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #ef4444; animation: blink .7s step-end infinite; flex-shrink: 0; box-shadow: 0 0 8px #ef4444; }
  .rec-type { font-size: 10px; font-weight: 700; color: #166534; letter-spacing: .06em; }
  .rec-meta { font-size: 8px; color: #4ade80; }
  .rec-player { padding: 0 10px 10px; }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80px; gap: 7px; color: #bbf7d0; font-size: 9px; letter-spacing: .14em; }
  .sidebar-footer { border-top: 1px solid #d1fae5; padding: 9px 13px; background: #ecfdf5; flex-shrink: 0; }
  .endpoint-label { font-size: 7px; color: #4ade80; letter-spacing: .1em; }
  .endpoint-box { background: #fffffffff; border: 1px solid #bbf7d0; padding: 3px 7px; font-size: 8px; color: #16a34a; letter-spacing: .04em; word-break: break-all; margin-top: 3px; }
  .tech-stack { margin-top: 7px; font-size: 7px; color: #bbf7d0; letter-spacing: .07em; line-height: 1.9; }
  .tab-badge { background: #ef4444; color: #ffffff; border-radius: 2px; padding: 1px 4px; font-size: 7px; font-weight: 700; letter-spacing: 0; animation: blink 1.5s step-end infinite; }

  @keyframes blink       { 50% { opacity: 0; } }
  @keyframes ticker      { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
  @keyframes fadeIn      { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scan        { 0% { transform: translateY(-100%); } 100% { transform: translateY(700%); } }
  @keyframes slideDown   { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes flashRed    { 0%,100% { background: #f0fdf4; } 25%,75% { background: #fef2f2; } }
  @keyframes borderPulse { 0%,100% { box-shadow: 0 0 12px #ef444430; } 50% { box-shadow: 0 0 28px #ef444455; } }
  @keyframes slideUp     { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  ::-webkit-scrollbar       { width: 3px; }
  ::-webkit-scrollbar-track { background: #fffffffff; }
  ::-webkit-scrollbar-thumb { background: #bbf7d0; border-radius: 2px; }

  @media (max-width: 860px) {
    .main { grid-template-columns: 1fr; }
    .sidebar { position: static; height: auto; max-height: 420px; border-left: none; border-top: 1px solid #d1fae5; }
    .cam-metrics-row { grid-template-columns: 1fr; }
    .video-wall-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .video-wall-grid.layout-3x3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 540px) {
    .topbar { padding: 7px 10px; }
    .brand-sub { display: none; }
    .left-panel { padding: 9px; gap: 8px; }
    .metrics-grid { gap: 5px; }
    .sidebar { max-height: 360px; }
    .clock { display: none; }
    .video-wall-grid,
    .video-wall-grid.layout-2x2,
    .video-wall-grid.layout-3x3,
    .video-wall-grid.layout-row,
    .video-wall-grid.layout-auto { grid-template-columns: 1fr; }
    .dev-chart-grid { grid-template-columns: 1fr; }
    .dev-chart-grid-two { grid-template-columns: 1fr; }
  }
`;

export { sessionGateStyles, dashboardStyles };
