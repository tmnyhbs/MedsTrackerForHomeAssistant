/**
 * Meds Tracker — Home Assistant Custom Panel
 * Styled to match HA visual standards.
 */

const PALETTE = [
  "#e53935","#fb8c00","#fdd835","#43a047",
  "#00acc1","#1e88e5","#8e24aa","#d81b60",
];

// ── SVG icons (single-colour, currentColor) ───────────────────
const ICONS = {
  pill: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M4.22 11.29l7.07-7.07a5 5 0 0 1 7.07 7.07l-7.07 7.07a5 5 0 0 1-7.07-7.07zm1.42 5.66a3 3 0 0 0 4.24 0L13 13.83 10.17 11 7.05 14.12a3 3 0 0 0-.88 2.12 3 3 0 0 0 .47 1.71zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" style="display:none"/>
    <path d="M4.22 11.29l7.07-7.07a5 5 0 0 1 7.07 7.07l-7.07 7.07a5 5 0 0 1-7.07-7.07zm1.42 1.42a3 3 0 0 0 4.24 4.24l3.11-3.12L9.76 9.59l-4.12 3.12zm9.9-7.07a3 3 0 0 0-4.25 0l-1.4 1.41 4.24 4.24 1.41-1.4a3 3 0 0 0 0-4.25z"/>
  </svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>`,
  delete: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>`,
  person: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>`,
  paw: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M4.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-8.5 1c-2.5 0-7.5 1.4-7.5 4.2V17h15v-2.3C21 10.9 16 10.5 11 10.5z"/>
  </svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`,
  add: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>`,
};

// ── Time helpers ──────────────────────────────────────────────
function to12hr(time24) {
  // "14:30" → { h: 2, m: 30, ampm: "PM" }
  const [hStr, mStr] = (time24 || "08:00").split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h < 12 ? "AM" : "PM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { h, m, ampm };
}

function to24hr(h, m, ampm) {
  // (2, 30, "PM") → "14:30"
  let hour = parseInt(h, 10);
  const min = parseInt(m, 10);
  if (ampm === "AM" && hour === 12) hour = 0;
  else if (ampm === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function buildTimePicker(prefix, current24) {
  const { h, m, ampm } = to12hr(current24);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const mins  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  return `
    <div class="time-picker">
      <select class="tp-h" data-tp="${prefix}">
        ${hours.map(x => `<option value="${x}"${x === h ? " selected" : ""}>${x}</option>`).join("")}
      </select>
      <span class="tp-sep">:</span>
      <select class="tp-m" data-tp="${prefix}">
        ${mins.map(x => `<option value="${x}"${x === m ? " selected" : ""}>${String(x).padStart(2,"0")}</option>`).join("")}
      </select>
      <select class="tp-ap" data-tp="${prefix}">
        <option value="AM"${ampm === "AM" ? " selected" : ""}>AM</option>
        <option value="PM"${ampm === "PM" ? " selected" : ""}>PM</option>
      </select>
    </div>`;
}

function readTimePicker(container, prefix) {
  const h    = container.querySelector(`.tp-h[data-tp="${prefix}"]`)?.value;
  const m    = container.querySelector(`.tp-m[data-tp="${prefix}"]`)?.value;
  const ampm = container.querySelector(`.tp-ap[data-tp="${prefix}"]`)?.value;
  // m can legitimately be "0" (12:00) — check for undefined, not falsy
  if (!h || m === undefined || m === null || !ampm) return null;
  return to24hr(h, m, ampm);
}

function fmt12hr(time24) {
  const { h, m, ampm } = to12hr(time24);
  return `${h}:${String(m).padStart(2,"0")} ${ampm}`;
}

// ── CSS ───────────────────────────────────────────────────────
const CSS = /* css */`
  :host {
    display: block;
    height: 100%;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    font-family: var(--mdc-typography-font-family, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
    font-size: 14px;
    --status-ok:   var(--success-color, #43a047);
    --status-warn: #fb8c00;
    --status-err:  var(--error-color, #e53935);
    --radius: var(--ha-card-border-radius, 12px);
  }
  * { box-sizing: border-box; }

  /* ── App shell ── */
  .app { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

  /* Top bar matches HA's app-header */
  .top-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 0 16px;
    height: 56px;
    background: var(--app-header-background-color, var(--primary-color));
    color: var(--app-header-text-color, #fff);
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,.2);
  }
  .top-bar-icon { display: flex; align-items: center; opacity: .9; }
  .top-bar h1 { margin: 0; font-size: 1.05rem; font-weight: 400; letter-spacing: .015em; }

  /* Tabs match HA paper-tabs */
  .tabs {
    display: flex;
    background: var(--app-header-background-color, var(--primary-color));
    border-bottom: 1px solid var(--divider-color);
    flex-shrink: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    padding: 0 24px;
    height: 48px;
    display: flex; align-items: center;
    cursor: pointer;
    font-size: 0.8rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
    color: var(--app-header-text-color, rgba(255,255,255,.7));
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color .15s, border-color .15s;
    user-select: none;
  }
  .tab:hover { color: var(--app-header-text-color, #fff); }
  .tab.active {
    color: var(--app-header-text-color, #fff);
    border-bottom-color: var(--app-header-text-color, #fff);
  }

  /* Main content area */
  .content { flex: 1; overflow-y: auto; padding: 16px; max-width: 900px; margin: 0 auto; width: 100%; }

  /* ── Cards match ha-card ── */
  .card {
    background: var(--card-background-color);
    border-radius: var(--radius);
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.12));
    margin-bottom: 16px;
    overflow: hidden;
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 16px 0;
    font-size: 1rem; font-weight: 500;
    color: var(--primary-text-color);
    letter-spacing: .025em;
  }
  .card-header-actions { display: flex; gap: 4px; }
  .card-body { padding: 12px 16px 16px; }
  .card-title { font-size: 1rem; font-weight: 500; }

  /* ── HA-style buttons ── */
  button { cursor: pointer; font-family: inherit; border: none; }

  /* Raised button (primary action) */
  .btn-raised {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 4px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
    transition: box-shadow .15s, opacity .15s;
    box-shadow: 0 2px 4px rgba(0,0,0,.2);
  }
  .btn-raised:hover { box-shadow: 0 4px 8px rgba(0,0,0,.25); }

  /* Outlined button */
  .btn-outlined {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 15px; border-radius: 4px;
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
    transition: background .15s;
  }
  .btn-outlined:hover { background: rgba(var(--rgb-primary-color, 3,169,244), .08); }

  /* Text button */
  .btn-text {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 8px; border-radius: 4px;
    background: transparent;
    color: var(--primary-color);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
    transition: background .15s;
  }
  .btn-text:hover { background: rgba(var(--rgb-primary-color, 3,169,244), .08); }

  /* Danger text */
  .btn-danger {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 8px; border-radius: 4px;
    background: transparent;
    color: var(--error-color, #e53935);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
    transition: background .15s;
  }
  .btn-danger:hover { background: rgba(229,57,53,.08); }

  /* Icon button */
  .btn-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    transition: background .15s;
  }
  .btn-icon:hover { background: var(--secondary-background-color); }
  .btn-icon.danger:hover { background: rgba(229,57,53,.08); color: var(--error-color, #e53935); }

  /* ── Summary strip ── */
  .summary-strip {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
    margin-bottom: 16px;
  }
  .summary-item {
    background: var(--card-background-color);
    border-radius: var(--radius);
    padding: 14px 8px; text-align: center;
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.1));
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
  }
  .summary-num { font-size: 2rem; font-weight: 300; line-height: 1; }
  .summary-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .06em;
    color: var(--secondary-text-color); margin-top: 4px; }
  .ok   { color: var(--status-ok); }
  .warn { color: var(--status-warn); }
  .err  { color: var(--status-err); }

  /* ── Dose list ── */
  .dose-list { display: flex; flex-direction: column; gap: 8px; }
  .dose-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(0,0,0,.04));
    border-left: 4px solid var(--divider-color);
    transition: background .15s;
  }
  .dose-row.confirmed { border-left-color: var(--status-ok); }
  .dose-row.missed    { border-left-color: var(--status-err); }
  .dose-row.pending   { border-left-color: var(--status-warn); }
  .dose-info { flex: 1; min-width: 0; }
  .dose-name { font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dose-sub  { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px; }
  .dose-meta { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 3px; }

  /* Status chip */
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 10px; border-radius: 12px;
    font-size: 0.72rem; font-weight: 500; white-space: nowrap;
    text-transform: uppercase; letter-spacing: .04em;
  }
  .chip-ok   { background: rgba(67,160,71,.12);  color: var(--status-ok); }
  .chip-warn { background: rgba(251,140,0,.12);  color: var(--status-warn); }
  .chip-err  { background: rgba(229,57,53,.12);  color: var(--status-err); }

  /* ── Person/pet list ── */
  .entity-list { display: flex; flex-direction: column; gap: 6px; }
  .entity-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(0,0,0,.03));
    transition: background .15s;
  }
  .entity-row:hover { background: var(--secondary-background-color); }
  .entity-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(var(--rgb-primary-color, 3,169,244), .1);
    color: var(--primary-color);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .entity-info { flex: 1; min-width: 0; }
  .entity-name { font-weight: 500; font-size: 0.9rem; }
  .entity-type { font-size: 0.75rem; color: var(--secondary-text-color); text-transform: capitalize; }
  .entity-actions { display: flex; }

  /* ── Med blocks ── */
  .med-block {
    border-left: 3px solid;
    border-radius: 0 8px 8px 0;
    padding: 10px 12px;
    margin-bottom: 6px;
    background: var(--secondary-background-color, rgba(0,0,0,.03));
  }
  .med-block-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .med-name-row { display: flex; align-items: center; gap: 8px; }
  .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .med-name { font-weight: 500; }
  .med-notes { font-size: 0.78rem; color: var(--secondary-text-color); margin-bottom: 8px; }

  .sch-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .sch-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 16px;
    background: rgba(var(--rgb-primary-color, 3,169,244), .08);
    color: var(--primary-color);
    font-size: 0.78rem;
  }

  .add-sch-row {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color);
    margin-top: 6px;
  }
  .add-sch-row input[type=text] { flex: 1; min-width: 100px; }
  .add-sch-label { flex: 1; min-width: 100px; }

  /* 12-hour time picker — !important needed to beat global select { width:100% } */
  .time-picker { display: inline-flex; align-items: center; gap: 4px; }
  .time-picker select {
    width: auto !important; padding: 8px 6px !important;
    background: var(--primary-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    color: var(--primary-text-color);
    font-size: 0.875rem; font-family: inherit;
    outline: none; cursor: pointer;
  }
  .time-picker select:focus { border-color: var(--primary-color); }
  .tp-h  { width: 58px !important; }
  .tp-m  { width: 58px !important; }
  .tp-ap { width: 62px !important; }
  .tp-sep { font-weight: 600; color: var(--secondary-text-color); padding: 0 1px; }

  /* Schedule chip action buttons */
  .sch-chip-actions { display: inline-flex; gap: 2px; margin-left: 2px; }
  .sch-chip-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: none; border: none; padding: 2px; border-radius: 3px;
    color: var(--primary-color); cursor: pointer; opacity: .6;
    transition: opacity .1s, color .1s;
  }
  .sch-chip-btn:hover { opacity: 1; }
  .sch-chip-btn.del:hover { color: var(--error-color, #e53935); }

  /* ── Notify services section (within med block) ── */
  .notify-section {
    margin-top: 8px; padding-top: 8px;
    border-top: 1px solid var(--divider-color);
  }
  .notify-section-label {
    font-size: 0.72rem; font-weight: 500; text-transform: uppercase;
    letter-spacing: .05em; color: var(--secondary-text-color);
    margin-bottom: 6px; display: flex; align-items: center; gap: 5px;
  }
  .notify-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .notify-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 16px;
    background: rgba(var(--rgb-accent-color, 255,152,0), .1);
    color: var(--accent-color, #ff9800);
    font-size: 0.78rem;
  }
  .notify-chip-btn {
    display: inline-flex; align-items: center;
    background: none; border: none; padding: 1px; border-radius: 3px;
    color: var(--accent-color, #ff9800); cursor: pointer; opacity: .6;
    transition: opacity .1s, color .1s;
  }
  .notify-chip-btn:hover { opacity: 1; color: var(--error-color, #e53935); }
  .notify-fallback {
    font-size: 0.75rem; color: var(--secondary-text-color); font-style: italic;
    margin-bottom: 6px;
  }
  .add-notify-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .add-notify-row select { flex: 1; min-width: 180px; }

  /* ── Group label ── */
  .group-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: .07em;
    color: var(--secondary-text-color);
    padding: 12px 0 6px;
    border-top: 1px solid var(--divider-color);
    margin-top: 4px;
  }
  .group-label:first-child { border-top: none; margin-top: 0; padding-top: 0; }

  /* ── Forms ── */
  .form-row { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 0.75rem; font-weight: 500;
    color: var(--secondary-text-color);
    text-transform: uppercase; letter-spacing: .04em;
    margin-bottom: 6px;
  }
  input[type=text], input[type=time], select, textarea {
    width: 100%; padding: 10px 12px;
    background: var(--primary-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    color: var(--primary-text-color);
    font-size: 0.875rem; font-family: inherit;
    outline: none; transition: border-color .15s;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--primary-color); }
  input::placeholder { color: var(--secondary-text-color); opacity: .6; }

  /* ── Color swatch ── */
  .color-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .swatch {
    width: 32px; height: 32px; border-radius: 50%;
    border: 3px solid transparent; cursor: pointer;
    transition: transform .15s, border-color .15s; outline: none;
  }
  .swatch.sel { border-color: var(--primary-text-color); transform: scale(1.15); }

  /* ── Divider ── */
  .divider { height: 1px; background: var(--divider-color); margin: 12px 0; }

  /* ── Settings ── */
  .settings-hint {
    font-size: 0.78rem; color: var(--secondary-text-color);
    margin-top: 4px; line-height: 1.5;
  }
  .danger-section { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(229,57,53,.3); }
  .danger-title { font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--error-color, #e53935); margin-bottom: 6px; }
  .danger-hint { font-size: 0.78rem; color: var(--secondary-text-color); margin-bottom: 10px; line-height: 1.5; }

  /* ── Modal ── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 16px;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--card-background-color);
    border-radius: var(--radius);
    box-shadow: 0 24px 48px rgba(0,0,0,.3);
    width: 100%; max-width: 440px;
    max-height: 90vh; overflow-y: auto;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 16px 0;
    font-size: 1.05rem; font-weight: 500;
  }
  .modal-body { padding: 16px; }
  .modal-footer {
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 8px 16px 16px;
    border-top: 1px solid var(--divider-color);
  }

  /* ── Empty state ── */
  .empty {
    text-align: center; padding: 48px 24px;
    color: var(--secondary-text-color);
  }
  .empty svg { opacity: .35; margin-bottom: 12px; }
  .empty-title { font-size: 1rem; font-weight: 500; margin-bottom: 6px; color: var(--primary-text-color); }
  .empty-msg { font-size: 0.875rem; margin-bottom: 20px; line-height: 1.6; }

  /* ── Loading ── */
  .loading { display: flex; align-items: center; justify-content: center; height: 200px; }
  .spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--divider-color);
    border-top-color: var(--primary-color);
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── Panel element ─────────────────────────────────────────────
class MedsTrackerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._doses  = [];
    this._notifyServices = [];   // available notify.* service names from HA
    this._tab    = "dashboard";
    this._loading = true;
    this._booted  = false;
    this._unsub   = null;
  }

  connectedCallback() { if (this._hass && !this._booted) this._boot(); }
  disconnectedCallback() { this._unsub?.(); }

  set hass(hass) {
    this._hass = hass;
    if (!this._booted) this._boot();
  }

  async _boot() {
    this._booted = true;
    this._renderShell();
    await this._fetch();
    this._loading = false;
    this._renderContent();
    this._subscribeEvents();
  }

  async _fetch() {
    try {
      const [cfg, doses, allServices] = await Promise.all([
        this._api("GET", "meds_tracker/config"),
        this._api("GET", "meds_tracker/doses/today"),
        this._api("GET", "services"),
      ]);
      this._config = cfg;
      this._doses  = doses || [];
      // allServices is an array of { domain, services: {...} }
      const notifyDomain = (allServices || []).find(s => s.domain === "notify");
      if (notifyDomain) {
        this._notifyServices = Object.keys(notifyDomain.services)
          .map(svc => `notify.${svc}`)
          .sort();
      }
    } catch (e) {
      console.error("[MedsTracker] fetch error", e);
      this._config = { recipients: [], medications: [], settings: {} };
      this._doses  = [];
    }
  }

  _api(method, path, body) { return this._hass.callApi(method, path, body); }

  _subscribeEvents() {
    this._hass.connection
      .subscribeEvents(async () => { await this._fetch(); this._renderContent(); }, "meds_tracker_update")
      .then(u => { this._unsub = u; })
      .catch(() => {});
  }

  // ── Shell ──────────────────────────────────────────────────
  _renderShell() {
    const sd = this.shadowRoot;
    sd.innerHTML = `
      <style>${CSS}</style>
      <div class="app">
        <div class="top-bar">
          <div class="top-bar-icon">${ICONS.pill}</div>
          <h1>Meds Tracker</h1>
        </div>
        <div class="tabs">
          ${["dashboard","recipients","medications","settings"].map(t => `
            <div class="tab${t === this._tab ? " active" : ""}" data-tab="${t}">
              ${{ dashboard:"Dashboard", recipients:"Recipients", medications:"Medications", settings:"Settings" }[t]}
            </div>`).join("")}
        </div>
        <div class="content" id="content">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>`;
    sd.querySelectorAll(".tab").forEach(el =>
      el.addEventListener("click", () => this._switchTab(el.dataset.tab))
    );
  }

  _switchTab(tab) {
    this._tab = tab;
    this.shadowRoot.querySelectorAll(".tab").forEach(el =>
      el.classList.toggle("active", el.dataset.tab === tab)
    );
    this._renderContent();
  }

  _renderContent() {
    const el = this.shadowRoot.getElementById("content");
    if (!el) return;
    if (this._loading) { el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`; return; }
    el.innerHTML = {
      dashboard:   () => this._buildDashboard(),
      recipients:  () => this._buildRecipients(),
      medications: () => this._buildMedications(),
      settings:    () => this._buildSettings(),
    }[this._tab]?.() ?? "";
    this._wire();
  }

  // ── Dashboard ──────────────────────────────────────────────
  _buildDashboard() {
    const meds = this._config?.medications ?? [];
    const recs  = this._config?.recipients  ?? [];
    const items = [];
    for (const med of meds)
      for (const sch of (med.schedules ?? []))
        items.push({ med, sch, rec: recs.find(r => r.id === med.recipient_id), status: this._doseStatus(med.id, sch.id, sch.time), dose: this._doseEntry(med.id, sch.id) });

    if (!items.length) return `
      <div class="empty">
        <div style="display:flex;justify-content:center;margin-bottom:12px">${ICONS.pill.replace('width="20"','width="48"').replace('height="20"','height="48"')}</div>
        <div class="empty-title">No medications scheduled</div>
        <div class="empty-msg">Add recipients and medications to start tracking doses.</div>
        <button class="btn-raised" data-goto="recipients">${ICONS.add} Get Started</button>
      </div>`;

    const confirmed = items.filter(i => i.status === "confirmed").length;
    const pending   = items.filter(i => i.status === "pending").length;
    const missed    = items.filter(i => i.status === "missed").length;
    const order     = { pending: 0, missed: 1, confirmed: 2 };
    items.sort((a, b) => order[a.status] - order[b.status]);

    return `
      <div class="summary-strip">
        <div class="summary-item"><div class="summary-num ok">${confirmed}</div><div class="summary-label">Given</div></div>
        <div class="summary-item"><div class="summary-num warn">${pending}</div><div class="summary-label">Pending</div></div>
        <div class="summary-item"><div class="summary-num err">${missed}</div><div class="summary-label">Missed</div></div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="dose-list">
            ${items.map(i => this._buildDoseRow(i)).join("")}
          </div>
        </div>
      </div>`;
  }

  _buildDoseRow({ med, sch, rec, status, dose }) {
    const chips = { confirmed: `<span class="chip chip-ok">${ICONS.check} Given</span>`, pending: `<span class="chip chip-warn">Pending</span>`, missed: `<span class="chip chip-err">Missed</span>` };
    const btn = status !== "confirmed"
      ? `<button class="btn-text" data-confirm-med="${med.id}" data-confirm-sch="${sch.id}">Mark given</button>` : "";
    const meta = dose
      ? `<div class="dose-meta">Given ${new Date(dose.confirmed_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}${dose.confirmed_by ? ` by ${this._esc(dose.confirmed_by)}` : ""}</div>` : "";
    return `
      <div class="dose-row ${status}" style="border-left-color:${med.color||'var(--primary-color)'}">
        <div class="dose-info">
          <div class="dose-name">${this._esc(med.name)}</div>
          <div class="dose-sub">${ICONS.clock} ${this._esc(sch.label || sch.time)} · ${rec ? this._esc(rec.name) : ""}${med.notes ? ` · ${this._esc(med.notes)}` : ""}</div>
          ${meta}
        </div>
        ${chips[status]}
        ${btn}
      </div>`;
  }

  // ── Recipients ─────────────────────────────────────────────
  _buildRecipients() {
    const recs = this._config?.recipients ?? [];
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recipients</span>
          <button class="btn-text" id="add-rec">${ICONS.add} Add</button>
        </div>
        <div class="card-body">
          ${!recs.length ? `
            <div class="empty" style="padding:24px 0">
              <div class="empty-title">No recipients yet</div>
              <div class="empty-msg">Add a pet or person to start tracking their medications.</div>
            </div>` :
            `<div class="entity-list">
              ${recs.map(r => `
                <div class="entity-row">
                  <div class="entity-avatar">${r.type === "person" ? ICONS.person : ICONS.paw}</div>
                  <div class="entity-info">
                    <div class="entity-name">${this._esc(r.name)}</div>
                    <div class="entity-type">${r.type}</div>
                  </div>
                  <div class="entity-actions">
                    <button class="btn-icon" data-edit-rec="${r.id}" title="Edit">${ICONS.edit}</button>
                    <button class="btn-icon danger" data-del-rec="${r.id}" title="Delete">${ICONS.delete}</button>
                  </div>
                </div>`).join("")}
            </div>`}
        </div>
      </div>`;
  }

  // ── Medications ────────────────────────────────────────────
  _buildMedications() {
    const recs = this._config?.recipients  ?? [];
    const meds = this._config?.medications ?? [];
    if (!recs.length) return `
      <div class="empty">
        <div class="empty-title">No recipients yet</div>
        <div class="empty-msg">Add at least one recipient before adding medications.</div>
        <button class="btn-raised" data-goto="recipients">${ICONS.person} Add Recipient</button>
      </div>`;

    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Medications</span>
          <button class="btn-text" id="add-med">${ICONS.add} Add</button>
        </div>
        <div class="card-body">
          ${!meds.length ? `
            <div class="empty" style="padding:24px 0">
              <div class="empty-title">No medications yet</div>
              <div class="empty-msg">Tap + Add to create your first medication.</div>
            </div>` :
            recs.map(rec => {
              const ms = meds.filter(m => m.recipient_id === rec.id);
              if (!ms.length) return "";
              return `
                <div class="group-label">
                  ${rec.type === "person" ? ICONS.person : ICONS.paw}
                  ${this._esc(rec.name)}
                </div>
                ${ms.map(m => this._buildMedBlock(m)).join("")}`;
            }).join("")}
        </div>
      </div>`;
  }

  _buildMedBlock(med) {
    const closeIcon = ICONS.close.replace('width="20"','width="12"').replace('height="20"','height="12"');
    const editIcon  = ICONS.edit.replace('width="18"','width="12"').replace('height="18"','height="12"');

    // ── Schedule chips ───────────────────────────────────────
    const scheduleChips = (med.schedules ?? []).map(s => `
      <span class="sch-chip">
        ${ICONS.clock}
        ${this._esc(s.label ? `${s.label} (${fmt12hr(s.time)})` : fmt12hr(s.time))}
        <span class="sch-chip-actions">
          <button class="sch-chip-btn" data-edit-sch="${s.id}" data-edit-sch-med="${med.id}" title="Edit time">${editIcon}</button>
          <button class="sch-chip-btn del" data-del-sch="${s.id}" data-del-sch-med="${med.id}" title="Remove">${closeIcon}</button>
        </span>
      </span>`).join("");

    // ── Notify service chips ─────────────────────────────────
    const assignedServices = med.notify_services ?? [];
    const globalService    = this._config?.settings?.notify_service ?? "notify.notify";

    const notifyChips = assignedServices.map(svc => `
      <span class="notify-chip">
        ${ICONS.bell} ${this._esc(svc)}
        <button class="notify-chip-btn" data-del-notify="${this._esc(svc)}" data-del-notify-med="${med.id}" title="Remove">${closeIcon}</button>
      </span>`).join("");

    // Services not already assigned, for the dropdown
    const available = this._notifyServices.filter(s => !assignedServices.includes(s));
    const addNotifyRow = `
      <div class="add-notify-row">
        <select class="add-notify-svc" data-med="${med.id}">
          <option value="">— select a service —</option>
          ${available.map(s => `<option value="${this._esc(s)}">${this._esc(s)}</option>`).join("")}
        </select>
        <button class="btn-text add-notify" data-med="${med.id}">${ICONS.add} Add</button>
      </div>`;

    return `
      <div class="med-block" style="border-left-color:${med.color || "var(--primary-color)"}">
        <div class="med-block-header">
          <div class="med-name-row">
            <div class="color-dot" style="background:${med.color || "var(--primary-color)"}"></div>
            <span class="med-name">${this._esc(med.name)}</span>
          </div>
          <div class="entity-actions">
            <button class="btn-icon" data-edit-med="${med.id}" title="Edit">${ICONS.edit}</button>
            <button class="btn-icon danger" data-del-med="${med.id}" title="Delete">${ICONS.delete}</button>
          </div>
        </div>
        ${med.notes ? `<div class="med-notes">${this._esc(med.notes)}</div>` : ""}

        ${scheduleChips
          ? `<div class="sch-chips">${scheduleChips}</div>`
          : `<div class="med-notes" style="margin-bottom:8px">No schedule times yet — add one below.</div>`}
        <div class="add-sch-row">
          ${buildTimePicker(`add_${med.id}`, "08:00")}
          <input type="text" class="sch-label add-sch-label" data-med="${med.id}" placeholder="Label (e.g. Morning)" />
          <button class="btn-text add-sch" data-med="${med.id}">${ICONS.add} Add time</button>
        </div>

        <div class="notify-section">
          <div class="notify-section-label">${ICONS.bell} Notifications</div>
          ${assignedServices.length
            ? `<div class="notify-chips">${notifyChips}</div>`
            : `<div class="notify-fallback">Using global default: ${this._esc(globalService)}</div>`}
          ${available.length ? addNotifyRow : `<div class="notify-fallback" style="margin-top:4px">All available notify services already assigned.</div>`}
        </div>
      </div>`;
  }

  // ── Settings ───────────────────────────────────────────────
  _buildSettings() {
    const s = this._config?.settings ?? {};
    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Notification Settings</span></div>
        <div class="card-body">
          <div class="form-row">
            <label class="form-label">Notify Service</label>
            <input type="text" id="ns-input" value="${this._esc(s.notify_service ?? "notify.notify")}" placeholder="notify.mobile_app_everyone" />
            <div class="settings-hint">The <code>notify.*</code> service used to send reminders to phones.</div>
          </div>
          <div class="form-row">
            <label class="form-label">Reminder delay (minutes)</label>
            <input type="text" id="rm-input" value="${s.reminder_minutes ?? 30}" style="max-width:80px" />
            <div class="settings-hint">A follow-up notification fires this many minutes after the scheduled time if the dose hasn't been confirmed.</div>
          </div>
          <button class="btn-raised" id="save-settings">Save settings</button>

          <div class="danger-section">
            <div class="danger-title">Danger zone</div>
            <div class="danger-hint">Permanently deletes all recipients, medications, schedules, and history.</div>
            <button class="btn-danger" id="reset-all">${ICONS.warning} Reset all data</button>
          </div>
        </div>
      </div>`;
  }

  // ── Wire ───────────────────────────────────────────────────
  _wire() {
    const sd = this.shadowRoot;
    sd.querySelectorAll("[data-goto]").forEach(el =>
      el.addEventListener("click", () => this._switchTab(el.dataset.goto))
    );
    sd.querySelectorAll("[data-confirm-med]").forEach(btn =>
      btn.addEventListener("click", () => this._confirmDose(btn.dataset.confirmMed, btn.dataset.confirmSch))
    );
    sd.getElementById("add-rec")?.addEventListener("click", () => this._modalAddRecipient());
    sd.querySelectorAll("[data-edit-rec]").forEach(btn =>
      btn.addEventListener("click", () => this._modalEditRecipient(btn.dataset.editRec))
    );
    sd.querySelectorAll("[data-del-rec]").forEach(btn =>
      btn.addEventListener("click", () => this._deleteRecipient(btn.dataset.delRec))
    );
    sd.getElementById("add-med")?.addEventListener("click", () => this._modalAddMed());
    sd.querySelectorAll("[data-edit-med]").forEach(btn =>
      btn.addEventListener("click", () => this._modalEditMed(btn.dataset.editMed))
    );
    sd.querySelectorAll("[data-del-med]").forEach(btn =>
      btn.addEventListener("click", () => this._deleteMed(btn.dataset.delMed))
    );
    sd.querySelectorAll(".add-sch").forEach(btn =>
      btn.addEventListener("click", () => {
        const mid   = btn.dataset.med;
        const time  = readTimePicker(sd, `add_${mid}`);
        const label = sd.querySelector(`.add-sch-label[data-med="${mid}"]`)?.value ?? "";
        if (time) this._addSchedule(mid, time, label);
      })
    );
    sd.querySelectorAll("[data-del-sch]").forEach(btn =>
      btn.addEventListener("click", () => this._deleteSchedule(btn.dataset.delSchMed, btn.dataset.delSch))
    );
    sd.querySelectorAll("[data-edit-sch]").forEach(btn =>
      btn.addEventListener("click", () => {
        const medId = btn.dataset.editSchMed;
        const schId = btn.dataset.editSch;
        const med   = this._config?.medications?.find(m => m.id === medId);
        const sch   = med?.schedules?.find(s => s.id === schId);
        if (sch) this._modalEditSchedule(medId, sch);
      })
    );
    // Notify service add/remove
    sd.querySelectorAll(".add-notify").forEach(btn =>
      btn.addEventListener("click", () => {
        const mid = btn.dataset.med;
        const svc = sd.querySelector(`.add-notify-svc[data-med="${mid}"]`)?.value;
        if (svc) this._addNotifyService(mid, svc);
      })
    );
    sd.querySelectorAll("[data-del-notify]").forEach(btn =>
      btn.addEventListener("click", () =>
        this._removeNotifyService(btn.dataset.delNotifyMed, btn.dataset.delNotify)
      )
    );
    sd.getElementById("save-settings")?.addEventListener("click", () => {
      const ns = sd.getElementById("ns-input")?.value?.trim();
      const rm = parseInt(sd.getElementById("rm-input")?.value) || 30;
      this._saveSettings(ns, rm);
    });
    sd.getElementById("reset-all")?.addEventListener("click", () => this._resetAll());
  }

  // ── Modals ─────────────────────────────────────────────────
  _modal(title, bodyHtml, onSave, saveLabel = "Save") {
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span>${title}</span>
          <button class="btn-icon" data-cancel>${ICONS.close}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-footer">
          <button class="btn-text" data-cancel>Cancel</button>
          <button class="btn-raised" data-ok>${saveLabel}</button>
        </div>
      </div>`;
    this.shadowRoot.appendChild(ov);
    ov.querySelectorAll("[data-cancel]").forEach(el => el.addEventListener("click", () => ov.remove()));
    ov.querySelector("[data-ok]").addEventListener("click", async () => { await onSave(ov); ov.remove(); });
    ov.addEventListener("click", e => { if (e.target === ov) ov.remove(); });
    // wire color swatches
    setTimeout(() => {
      ov.querySelectorAll(".swatch").forEach(sw =>
        sw.addEventListener("click", () => {
          ov.querySelectorAll(".swatch").forEach(s => s.classList.remove("sel"));
          sw.classList.add("sel");
          ov.querySelector("#m-color").value = sw.dataset.color;
        })
      );
    }, 0);
  }

  _colorPicker(current) {
    return `
      <div class="color-row">
        ${PALETTE.map(c => `<div class="swatch${c === (current || PALETTE[5]) ? " sel" : ""}" style="background:${c}" data-color="${c}" tabindex="0"></div>`).join("")}
      </div>
      <input type="hidden" id="m-color" value="${current || PALETTE[5]}" />`;
  }

  _modalAddRecipient() {
    this._modal("Add Recipient", `
      <div class="form-row">
        <label class="form-label">Name</label>
        <input type="text" id="m-name" placeholder="Bun, Alice…" autofocus />
      </div>
      <div class="form-row">
        <label class="form-label">Type</label>
        <select id="m-type">
          <option value="pet">Pet</option>
          <option value="person">Person</option>
        </select>
      </div>`, async ov => {
        const name = ov.querySelector("#m-name")?.value?.trim();
        const type = ov.querySelector("#m-type")?.value;
        if (!name) return;
        await this._api("POST", "meds_tracker/recipients", { name, type, icon: type === "person" ? "mdi:account" : "mdi:paw" });
        await this._fetch(); this._renderContent();
    }, "Add");
  }

  _modalEditRecipient(id) {
    const r = this._config?.recipients?.find(x => x.id === id);
    if (!r) return;
    this._modal("Edit Recipient", `
      <div class="form-row">
        <label class="form-label">Name</label>
        <input type="text" id="m-name" value="${this._esc(r.name)}" autofocus />
      </div>
      <div class="form-row">
        <label class="form-label">Type</label>
        <select id="m-type">
          <option value="pet" ${r.type === "pet" ? "selected" : ""}>Pet</option>
          <option value="person" ${r.type === "person" ? "selected" : ""}>Person</option>
        </select>
      </div>`, async ov => {
        const name = ov.querySelector("#m-name")?.value?.trim();
        const type = ov.querySelector("#m-type")?.value;
        if (!name) return;
        await this._api("PUT", `meds_tracker/recipients/${id}`, { name, type });
        await this._fetch(); this._renderContent();
    });
  }

  _modalAddMed() {
    const recs = this._config?.recipients ?? [];
    this._modal("Add Medication", `
      <div class="form-row">
        <label class="form-label">Recipient</label>
        <select id="m-rec">${recs.map(r => `<option value="${r.id}">${this._esc(r.name)}</option>`).join("")}</select>
      </div>
      <div class="form-row">
        <label class="form-label">Medication Name</label>
        <input type="text" id="m-name" placeholder="Metacam, Amoxicillin…" autofocus />
      </div>
      <div class="form-row">
        <label class="form-label">Notes / Dosage</label>
        <input type="text" id="m-notes" placeholder="0.3ml with food" />
      </div>
      <div class="form-row">
        <label class="form-label">Colour</label>
        ${this._colorPicker(PALETTE[5])}
      </div>`, async ov => {
        const rec_id = ov.querySelector("#m-rec")?.value;
        const name   = ov.querySelector("#m-name")?.value?.trim();
        const notes  = ov.querySelector("#m-notes")?.value?.trim();
        const color  = ov.querySelector("#m-color")?.value;
        if (!name || !rec_id) return;
        await this._api("POST", "meds_tracker/medications", { recipient_id: rec_id, name, notes, color });
        await this._fetch(); this._renderContent();
    }, "Add");
  }

  _modalEditMed(id) {
    const m = this._config?.medications?.find(x => x.id === id);
    if (!m) return;
    this._modal("Edit Medication", `
      <div class="form-row">
        <label class="form-label">Name</label>
        <input type="text" id="m-name" value="${this._esc(m.name)}" autofocus />
      </div>
      <div class="form-row">
        <label class="form-label">Notes / Dosage</label>
        <input type="text" id="m-notes" value="${this._esc(m.notes || "")}" />
      </div>
      <div class="form-row">
        <label class="form-label">Colour</label>
        ${this._colorPicker(m.color)}
      </div>`, async ov => {
        const name  = ov.querySelector("#m-name")?.value?.trim();
        const notes = ov.querySelector("#m-notes")?.value?.trim();
        const color = ov.querySelector("#m-color")?.value;
        if (!name) return;
        await this._api("PUT", `meds_tracker/medications/${id}`, { name, notes, color });
        await this._fetch(); this._renderContent();
    });
  }

  _modalEditSchedule(medId, sch) {
    this._modal("Edit Schedule Time", `
      <div class="form-row">
        <label class="form-label">Time</label>
        ${buildTimePicker("edit_sch", sch.time)}
      </div>
      <div class="form-row">
        <label class="form-label">Label (optional)</label>
        <input type="text" id="m-sch-label" value="${this._esc(sch.label || "")}" placeholder="Morning, Evening…" autofocus />
      </div>`, async ov => {
        const newTime  = readTimePicker(ov, "edit_sch");
        const newLabel = ov.querySelector("#m-sch-label")?.value?.trim() ?? "";
        if (!newTime) {
          console.error("[MedsTracker] readTimePicker returned null for edit_sch", ov.innerHTML);
          return;
        }
        await this._api("DELETE", `meds_tracker/medications/${medId}/schedules/${sch.id}`);
        await this._api("POST",   `meds_tracker/medications/${medId}/schedules`, { time: newTime, label: newLabel });
        await this._fetch();
        this._renderContent();
    });
  }

  // ── Actions ────────────────────────────────────────────────
  async _confirmDose(medId, schId) {
    await this._api("POST", "meds_tracker/doses/confirm", { medication_id: medId, schedule_id: schId, confirmed_by: this._hass?.user?.name ?? "" });
    await this._fetch(); this._renderContent();
  }

  async _deleteRecipient(id) {
    const r = this._config?.recipients?.find(x => x.id === id);
    if (!confirm(`Delete "${r?.name}" and all their medications? This cannot be undone.`)) return;
    await this._api("DELETE", `meds_tracker/recipients/${id}`);
    await this._fetch(); this._renderContent();
  }

  async _deleteMed(id) {
    const m = this._config?.medications?.find(x => x.id === id);
    if (!confirm(`Delete "${m?.name}"? This cannot be undone.`)) return;
    await this._api("DELETE", `meds_tracker/medications/${id}`);
    await this._fetch(); this._renderContent();
  }

  async _addSchedule(medId, time, label) {
    await this._api("POST", `meds_tracker/medications/${medId}/schedules`, { time, label });
    await this._fetch(); this._renderContent();
  }

  async _deleteSchedule(medId, schId) {
    await this._api("DELETE", `meds_tracker/medications/${medId}/schedules/${schId}`);
    await this._fetch(); this._renderContent();
  }

  async _addNotifyService(medId, svc) {
    const med = this._config?.medications?.find(m => m.id === medId);
    if (!med) return;
    const services = [...(med.notify_services ?? [])];
    if (services.includes(svc)) return;
    services.push(svc);
    await this._api("PUT", `meds_tracker/medications/${medId}`, { notify_services: services });
    await this._fetch(); this._renderContent();
  }

  async _removeNotifyService(medId, svc) {
    const med = this._config?.medications?.find(m => m.id === medId);
    if (!med) return;
    const services = (med.notify_services ?? []).filter(s => s !== svc);
    await this._api("PUT", `meds_tracker/medications/${medId}`, { notify_services: services });
    await this._fetch(); this._renderContent();
  }

  async _saveSettings(ns, rm) {
    await this._api("PUT", "meds_tracker/settings", { notify_service: ns, reminder_minutes: rm });
    await this._fetch(); this._renderContent();
    const btn = this.shadowRoot.getElementById("save-settings");
    if (btn) { btn.textContent = "✓ Saved"; setTimeout(() => { btn.textContent = "Save settings"; }, 2000); }
  }

  async _resetAll() {
    if (!confirm("Delete ALL data? This cannot be undone.")) return;
    for (const r of (this._config?.recipients ?? []))
      await this._api("DELETE", `meds_tracker/recipients/${r.id}`);
    await this._fetch(); this._renderContent();
  }

  // ── Utils ──────────────────────────────────────────────────
  _doseStatus(medId, schId, time) {
    if (this._doseEntry(medId, schId)) return "confirmed";
    const now = new Date();
    try {
      const [h, m] = time.split(":").map(Number);
      if (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m + 1)) return "missed";
    } catch (_) {}
    return "pending";
  }
  _doseEntry(medId, schId) { return this._doses.find(d => d.medication_id === medId && d.schedule_id === schId); }
  _esc(s) { return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
}

customElements.define("meds-tracker-panel", MedsTrackerPanel);
