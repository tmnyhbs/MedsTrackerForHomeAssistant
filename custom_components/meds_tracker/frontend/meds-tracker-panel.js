/**
 * Meds Tracker — Home Assistant Custom Panel v2
 * Features: recurrence scheduling, edit confirmed-by, per-med notifications,
 * 12hr time picker, HA visual standards.
 */

// ── Palette & constants ────────────────────────────────────────
const PALETTE = [
  "#e53935","#fb8c00","#fdd835","#43a047",
  "#00acc1","#1e88e5","#8e24aa","#d81b60",
];
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── SVG icons ─────────────────────────────────────────────────
const ICONS = {
  pill: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M4.22 11.29l7.07-7.07a5 5 0 0 1 7.07 7.07l-7.07 7.07a5 5 0 0 1-7.07-7.07zm1.42 1.42a3 3 0 0 0 4.24 4.24l3.11-3.12L9.76 9.59l-4.12 3.12zm9.9-7.07a3 3 0 0 0-4.25 0l-1.4 1.41 4.24 4.24 1.41-1.4a3 3 0 0 0 0-4.25z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
  delete: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`,
  person: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  paw: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M4.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-8.5 1c-2.5 0-7.5 1.4-7.5 4.2V17h15v-2.3C21 10.9 16 10.5 11 10.5z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  add: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
};

// ── Time helpers ───────────────────────────────────────────────
function to12hr(t24) {
  const [hStr, mStr] = (t24 || "08:00").split(":");
  let h = parseInt(hStr, 10); const m = parseInt(mStr, 10);
  const ap = h < 12 ? "AM" : "PM";
  if (h === 0) h = 12; else if (h > 12) h -= 12;
  return { h, m, ap };
}
function to24hr(h, m, ap) {
  let hour = parseInt(h, 10); const min = parseInt(m, 10);
  if (ap === "AM" && hour === 12) hour = 0;
  else if (ap === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
}
function buildTimePicker(prefix, cur24) {
  const { h, m, ap } = to12hr(cur24);
  const hours = Array.from({length:12},(_,i)=>i+1);
  const mins  = [0,5,10,15,20,25,30,35,40,45,50,55];
  return `<div class="time-picker">
    <select class="tp-h" data-tp="${prefix}">${hours.map(x=>`<option value="${x}"${x===h?" selected":""}>${x}</option>`).join("")}</select>
    <span class="tp-sep">:</span>
    <select class="tp-m" data-tp="${prefix}">${mins.map(x=>`<option value="${x}"${x===m?" selected":""}>${String(x).padStart(2,"0")}</option>`).join("")}</select>
    <select class="tp-ap" data-tp="${prefix}">
      <option value="AM"${ap==="AM"?" selected":""}>AM</option>
      <option value="PM"${ap==="PM"?" selected":""}>PM</option>
    </select>
  </div>`;
}
function readTimePicker(container, prefix) {
  const h = container.querySelector(`.tp-h[data-tp="${prefix}"]`)?.value;
  const m = container.querySelector(`.tp-m[data-tp="${prefix}"]`)?.value;
  const ap = container.querySelector(`.tp-ap[data-tp="${prefix}"]`)?.value;
  if (!h || m === undefined || m === null || !ap) return null;
  return to24hr(h, m, ap);
}
function fmt12hr(t24) {
  if (!t24) return "";
  const { h, m, ap } = to12hr(t24);
  return `${h}:${String(m).padStart(2,"0")} ${ap}`;
}

// ── Recurrence helpers ─────────────────────────────────────────
function recLabel(rec) {
  if (!rec || rec.type === "daily") return "Daily";
  if (rec.type === "weekly") {
    const days = (rec.days || []).map(d => DAYS_SHORT[d]).join(", ");
    const every = rec.every_weeks > 1 ? `every ${rec.every_weeks} weeks` : "weekly";
    return `${every} · ${days || "?"}`;
  }
  if (rec.type === "interval") {
    const d = rec.interval_days || 1;
    return `Every ${d} day${d !== 1 ? "s" : ""}`;
  }
  return "Custom";
}

function buildRecurrenceForm(prefix, existing) {
  const rec = existing || { type: "daily" };
  const type = rec.type || "daily";
  const weeklyDays = rec.days || [];
  const everyWeeks = rec.every_weeks || 1;
  const intervalDays = rec.interval_days || 2;

  return `
    <div class="form-row">
      <label class="form-label">Repeats</label>
      <select id="${prefix}-rec-type">
        <option value="daily"${type==="daily"?" selected":""}>Every day</option>
        <option value="weekly"${type==="weekly"?" selected":""}>Specific days of the week</option>
        <option value="interval"${type==="interval"?" selected":""}>Every N days</option>
      </select>
    </div>
    <div id="${prefix}-rec-weekly" style="display:${type==="weekly"?"block":"none"}">
      <div class="form-row">
        <label class="form-label">On these days</label>
        <div class="weekday-row">
          ${DAYS_SHORT.map((d,i)=>`
            <label class="weekday-btn">
              <input type="checkbox" name="${prefix}-wd" value="${i}"${weeklyDays.includes(i)?" checked":""}/>
              <span>${d}</span>
            </label>`).join("")}
        </div>
      </div>
      <div class="form-row">
        <label class="form-label">Frequency</label>
        <div class="inline-num">
          <span class="inline-num-label">Every</span>
          <input type="number" id="${prefix}-every-weeks" value="${everyWeeks}" min="1" max="52" />
          <span class="inline-num-label">week(s)</span>
        </div>
      </div>
    </div>
    <div id="${prefix}-rec-interval" style="display:${type==="interval"?"block":"none"}">
      <div class="form-row">
        <label class="form-label">Interval</label>
        <div class="inline-num">
          <span class="inline-num-label">Every</span>
          <input type="number" id="${prefix}-interval-days" value="${intervalDays}" min="0.5" step="0.5" />
          <span class="inline-num-label">days</span>
        </div>
        <div class="settings-hint">Decimals are supported (e.g. 3.5 for every three and a half days).</div>
      </div>
    </div>`;
}

function readRecurrence(ov, prefix) {
  const type = ov.querySelector(`#${prefix}-rec-type`)?.value ?? "daily";
  if (type === "weekly") {
    const days = [...ov.querySelectorAll(`input[name="${prefix}-wd"]:checked`)].map(cb => parseInt(cb.value));
    const everyWeeks = parseInt(ov.querySelector(`#${prefix}-every-weeks`)?.value) || 1;
    return { type: "weekly", days, every_weeks: everyWeeks, start_date: new Date().toISOString().split("T")[0] };
  }
  if (type === "interval") {
    const d = parseFloat(ov.querySelector(`#${prefix}-interval-days`)?.value) || 1;
    return { type: "interval", interval_days: d };
  }
  return { type: "daily" };
}

function wireRecurrenceToggle(ov, prefix) {
  ov.querySelector(`#${prefix}-rec-type`)?.addEventListener("change", e => {
    ov.querySelector(`#${prefix}-rec-weekly`).style.display = e.target.value === "weekly" ? "block" : "none";
    ov.querySelector(`#${prefix}-rec-interval`).style.display = e.target.value === "interval" ? "block" : "none";
  });
}

// ── CSS ────────────────────────────────────────────────────────
const CSS = /* css */`
  :host {
    display: block; height: 100%;
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

  .app { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

  .top-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 0 16px; height: 56px;
    background: var(--app-header-background-color, var(--primary-color));
    color: var(--app-header-text-color, #fff);
    flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,.2);
  }
  .top-bar-icon { display: flex; align-items: center; opacity: .9; }
  .top-bar h1 { margin: 0; font-size: 1.05rem; font-weight: 400; letter-spacing: .015em; }

  .tabs {
    display: flex;
    background: var(--app-header-background-color, var(--primary-color));
    border-bottom: 1px solid var(--divider-color);
    flex-shrink: 0; overflow-x: auto;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    padding: 0 24px; height: 48px;
    display: flex; align-items: center; cursor: pointer;
    font-size: 0.8rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
    color: var(--app-header-text-color, rgba(255,255,255,.7));
    border-bottom: 2px solid transparent; white-space: nowrap;
    transition: color .15s, border-color .15s; user-select: none;
  }
  .tab:hover { color: var(--app-header-text-color, #fff); }
  .tab.active { color: var(--app-header-text-color, #fff); border-bottom-color: var(--app-header-text-color, #fff); }

  .content { flex: 1; overflow-y: auto; padding: 16px; max-width: 900px; margin: 0 auto; width: 100%; }

  /* Cards */
  .card {
    background: var(--card-background-color);
    border-radius: var(--radius);
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.12));
    margin-bottom: 16px; overflow: hidden;
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 16px 0;
    font-size: 1rem; font-weight: 500; color: var(--primary-text-color); letter-spacing: .025em;
  }
  .card-title { font-size: 1rem; font-weight: 500; }
  .card-body { padding: 12px 16px 16px; }

  /* Buttons */
  button { cursor: pointer; font-family: inherit; border: none; }
  .btn-raised {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 4px;
    background: var(--primary-color); color: var(--text-primary-color, #fff);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
    box-shadow: 0 2px 4px rgba(0,0,0,.2); transition: box-shadow .15s;
  }
  .btn-raised:hover { box-shadow: 0 4px 8px rgba(0,0,0,.25); }
  .btn-outlined {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 15px; border-radius: 4px; background: transparent;
    color: var(--primary-color); border: 1px solid var(--primary-color);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
    transition: background .15s;
  }
  .btn-text {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 8px; border-radius: 4px; background: transparent;
    color: var(--primary-color);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
    transition: background .15s;
  }
  .btn-text:hover { background: rgba(var(--rgb-primary-color,3,169,244),.08); }
  .btn-danger {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 8px; border-radius: 4px; background: transparent;
    color: var(--error-color, #e53935);
    font-size: 0.875rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
    transition: background .15s;
  }
  .btn-danger:hover { background: rgba(229,57,53,.08); }
  .btn-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%; background: transparent;
    color: var(--secondary-text-color); transition: background .15s;
  }
  .btn-icon:hover { background: var(--secondary-background-color); }
  .btn-icon.danger:hover { background: rgba(229,57,53,.08); color: var(--error-color, #e53935); }

  /* Summary strip */
  .summary-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
  .summary-item {
    background: var(--card-background-color); border-radius: var(--radius);
    padding: 14px 8px; text-align: center;
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.1));
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
  }
  .summary-num { font-size: 2rem; font-weight: 300; line-height: 1; }
  .summary-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--secondary-text-color); margin-top: 4px; }
  .ok   { color: var(--status-ok); }
  .warn { color: var(--status-warn); }
  .err  { color: var(--status-err); }

  /* Dose list */
  .dose-list { display: flex; flex-direction: column; gap: 8px; }
  .dose-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px; border-radius: 8px;
    background: var(--secondary-background-color, rgba(0,0,0,.04));
    border-left: 4px solid var(--divider-color);
  }
  .dose-row.confirmed { border-left-color: var(--status-ok); }
  .dose-row.missed    { border-left-color: var(--status-err); }
  .dose-row.pending   { border-left-color: var(--status-warn); }
  .dose-info { flex: 1; min-width: 0; }
  .dose-name { font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dose-sub  { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px; }
  .dose-meta { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .dose-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

  /* Chips */
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 10px; border-radius: 12px;
    font-size: 0.72rem; font-weight: 500; white-space: nowrap;
    text-transform: uppercase; letter-spacing: .04em;
  }
  .chip-ok   { background: rgba(67,160,71,.12);  color: var(--status-ok); }
  .chip-warn { background: rgba(251,140,0,.12);  color: var(--status-warn); }
  .chip-err  { background: rgba(229,57,53,.12);  color: var(--status-err); }

  /* Entity list */
  .entity-list { display: flex; flex-direction: column; gap: 6px; }
  .entity-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 8px;
    background: var(--secondary-background-color, rgba(0,0,0,.03));
    transition: background .15s;
  }
  .entity-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(var(--rgb-primary-color,3,169,244),.1);
    color: var(--primary-color);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .entity-info { flex: 1; min-width: 0; }
  .entity-name { font-weight: 500; font-size: 0.9rem; }
  .entity-type { font-size: 0.75rem; color: var(--secondary-text-color); text-transform: capitalize; }
  .entity-actions { display: flex; }

  /* Med blocks */
  .med-block {
    border-left: 3px solid; border-radius: 0 8px 8px 0;
    padding: 10px 12px; margin-bottom: 6px;
    background: var(--secondary-background-color, rgba(0,0,0,.03));
  }
  .med-block-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .med-name-row { display: flex; align-items: center; gap: 8px; }
  .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .med-name { font-weight: 500; }
  .med-notes { font-size: 0.78rem; color: var(--secondary-text-color); margin-bottom: 8px; }

  .sch-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
  .sch-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 16px;
    background: rgba(var(--rgb-primary-color,3,169,244),.08);
    color: var(--primary-color); font-size: 0.78rem;
  }
  .sch-chip-actions { display: inline-flex; gap: 2px; margin-left: 2px; }
  .sch-chip-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: none; border: none; padding: 2px; border-radius: 3px;
    color: var(--primary-color); cursor: pointer; opacity: .6; transition: opacity .1s, color .1s;
  }
  .sch-chip-btn:hover { opacity: 1; }
  .sch-chip-btn.del:hover { color: var(--error-color, #e53935); }
  .rec-badge {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 0.7rem; color: var(--secondary-text-color); margin-left: 2px;
  }

  /* Notify section */
  .notify-section { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--divider-color); }
  .section-sublabel {
    font-size: 0.72rem; font-weight: 500; text-transform: uppercase;
    letter-spacing: .05em; color: var(--secondary-text-color);
    margin-bottom: 6px; display: flex; align-items: center; gap: 5px;
  }
  .notify-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .notify-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 16px;
    background: rgba(var(--rgb-accent-color,255,152,0),.1);
    color: var(--accent-color, #ff9800); font-size: 0.78rem;
  }
  .notify-chip-btn {
    display: inline-flex; align-items: center;
    background: none; border: none; padding: 1px; border-radius: 3px;
    color: var(--accent-color,#ff9800); cursor: pointer; opacity: .6; transition: opacity .1s, color .1s;
  }
  .notify-chip-btn:hover { opacity: 1; color: var(--error-color, #e53935); }
  .notify-fallback { font-size: 0.75rem; color: var(--secondary-text-color); font-style: italic; margin-bottom: 6px; }
  .add-notify-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .add-notify-row select { flex: 1; min-width: 180px; }

  /* Group label */
  .group-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: .07em;
    color: var(--secondary-text-color);
    padding: 12px 0 6px; border-top: 1px solid var(--divider-color); margin-top: 4px;
  }
  .group-label:first-child { border-top: none; margin-top: 0; padding-top: 0; }

  /* Forms */
  .form-row { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 0.75rem; font-weight: 500;
    color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px;
  }
  input[type=text], input[type=number], select, textarea {
    width: 100%; padding: 10px 12px;
    background: var(--primary-background-color);
    border: 1px solid var(--divider-color); border-radius: 4px;
    color: var(--primary-text-color); font-size: 0.875rem; font-family: inherit;
    outline: none; transition: border-color .15s;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--primary-color); }
  input::placeholder { color: var(--secondary-text-color); opacity: .6; }

  /* Time picker */
  .time-picker { display: inline-flex; align-items: center; gap: 4px; }
  .time-picker select { width: auto !important; padding: 8px 6px !important; }
  .tp-h { width: 58px !important; } .tp-m { width: 58px !important; } .tp-ap { width: 62px !important; }
  .tp-sep { font-weight: 600; color: var(--secondary-text-color); padding: 0 1px; }

  /* Weekday picker */
  .weekday-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .weekday-btn {
    display: inline-flex; align-items: center; gap: 0;
    cursor: pointer;
  }
  .weekday-btn input { display: none; }
  .weekday-btn span {
    display: inline-block; padding: 5px 9px; border-radius: 16px;
    font-size: 0.78rem; font-weight: 500;
    background: var(--secondary-background-color);
    border: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
    transition: background .15s, color .15s, border-color .15s;
  }
  .weekday-btn input:checked + span {
    background: var(--primary-color); color: #fff; border-color: var(--primary-color);
  }

  /* Inline number input */
  .inline-num { display: flex; align-items: center; gap: 8px; }
  .inline-num input { max-width: 80px; width: auto; }
  .inline-num-label { font-size: 0.875rem; color: var(--secondary-text-color); white-space: nowrap; }

  /* Colour swatch */
  .color-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .swatch {
    width: 32px; height: 32px; border-radius: 50%;
    border: 3px solid transparent; cursor: pointer;
    transition: transform .15s, border-color .15s; outline: none;
  }
  .swatch.sel { border-color: var(--primary-text-color); transform: scale(1.15); }

  /* Settings */
  .settings-hint { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 4px; line-height: 1.5; }
  .danger-section { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(229,57,53,.3); }
  .danger-title { font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--error-color,#e53935); margin-bottom: 6px; }
  .danger-hint { font-size: 0.78rem; color: var(--secondary-text-color); margin-bottom: 10px; line-height: 1.5; }

  /* Modal */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 16px; backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--card-background-color); border-radius: var(--radius);
    box-shadow: 0 24px 48px rgba(0,0,0,.3);
    width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 16px 0; font-size: 1.05rem; font-weight: 500;
  }
  .modal-body { padding: 16px; }
  .modal-footer {
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 8px 16px 16px; border-top: 1px solid var(--divider-color);
  }

  /* Empty */
  .empty { text-align: center; padding: 48px 24px; color: var(--secondary-text-color); }
  .empty-title { font-size: 1rem; font-weight: 500; margin-bottom: 6px; color: var(--primary-text-color); }
  .empty-msg { font-size: 0.875rem; margin-bottom: 20px; line-height: 1.6; }

  /* Loading */
  .loading { display: flex; align-items: center; justify-content: center; height: 200px; }
  .spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--divider-color); border-top-color: var(--primary-color); animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── Panel element ──────────────────────────────────────────────
class MedsTrackerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._doses = [];
    this._notifyServices = [];
    this._haUsers = [];
    this._tab = "dashboard";
    this._loading = true;
    this._booted = false;
    this._unsub = null;
  }

  connectedCallback() { if (this._hass && !this._booted) this._boot(); }
  disconnectedCallback() { this._unsub?.(); }
  set hass(hass) { this._hass = hass; if (!this._booted) this._boot(); }

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
      this._doses = doses || [];
      const nd = (allServices || []).find(s => s.domain === "notify");
      this._notifyServices = nd ? Object.keys(nd.services).map(s => `notify.${s}`).sort() : [];
    } catch (e) {
      console.error("[MedsTracker] fetch error", e);
      this._config = { recipients: [], medications: [], settings: {} };
      this._doses = [];
    }
    // Fetch HA users (admin only — graceful fallback)
    try {
      const users = await this._api("GET", "config/auth/users");
      this._haUsers = (users || []).filter(u => !u.system_generated && u.name).map(u => u.name).sort();
    } catch (_) {
      this._haUsers = (this._config?.recipients ?? []).filter(r => r.type === "person").map(r => r.name);
    }
  }

  _api(method, path, body) { return this._hass.callApi(method, path, body); }

  _subscribeEvents() {
    this._hass.connection
      .subscribeEvents(async () => { await this._fetch(); this._renderContent(); }, "meds_tracker_update")
      .then(u => { this._unsub = u; }).catch(() => {});
  }

  // ── Shell ────────────────────────────────────────────────────
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
          ${["dashboard","recipients","medications","settings"].map(t=>`
            <div class="tab${t===this._tab?" active":""}" data-tab="${t}">
              ${{dashboard:"Dashboard",recipients:"Recipients",medications:"Medications",settings:"Settings"}[t]}
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

  // ── Dashboard ────────────────────────────────────────────────
  _buildDashboard() {
    const meds = this._config?.medications ?? [];
    const recs  = this._config?.recipients  ?? [];
    const items = [];
    for (const med of meds) {
      const rec = recs.find(r => r.id === med.recipient_id);
      for (const sch of (med.schedules ?? [])) {
        if (sch.due_today === false) continue;   // non-daily, not due today
        const status = this._doseStatus(med.id, sch.id, sch.time);
        const dose   = this._doseEntry(med.id, sch.id);
        items.push({ med, sch, rec, status, dose });
      }
    }
    if (!items.length) return `
      <div class="empty">
        <div style="display:flex;justify-content:center;margin-bottom:12px">${ICONS.pill.replace('width="20"','width="48"').replace('height="20"','height="48"')}</div>
        <div class="empty-title">No medications due today</div>
        <div class="empty-msg">Add recipients and medications, or check the Medications tab to review schedules.</div>
        <button class="btn-raised" data-goto="recipients">${ICONS.add} Get Started</button>
      </div>`;

    const confirmed = items.filter(i=>i.status==="confirmed").length;
    const pending   = items.filter(i=>i.status==="pending").length;
    const missed    = items.filter(i=>i.status==="missed").length;
    const order     = {pending:0, missed:1, confirmed:2};
    items.sort((a,b) => order[a.status] - order[b.status]);

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
    const chips = {
      confirmed: `<span class="chip chip-ok">${ICONS.check} Given</span>`,
      pending:   `<span class="chip chip-warn">Pending</span>`,
      missed:    `<span class="chip chip-err">Missed</span>`,
    };
    const confirmBtn = status !== "confirmed"
      ? `<button class="btn-text" data-confirm-med="${med.id}" data-confirm-sch="${sch.id}">Mark given</button>` : "";

    const confirmedAt = dose ? new Date(dose.confirmed_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : null;
    const confirmedBy = dose?.confirmed_by || "";
    const givenMeta = dose ? `
      <span>Given ${confirmedAt}${confirmedBy ? ` by ${this._esc(confirmedBy)}` : ""}</span>
      <button class="btn-icon" style="width:20px;height:20px;font-size:12px"
        data-edit-giver-med="${med.id}" data-edit-giver-sch="${sch.id}"
        data-edit-giver-date="${dose.date}" data-edit-giver-by="${this._esc(confirmedBy)}"
        title="Edit who gave this">${ICONS.edit.replace('width="18"','width="13"').replace('height="18"','height="13"')}</button>` : "";

    return `
      <div class="dose-row ${status}" style="border-left-color:${med.color||"var(--primary-color)"}">
        <div class="dose-info">
          <div class="dose-name">${this._esc(med.name)}</div>
          <div class="dose-sub">${ICONS.clock} ${this._esc(sch.label||sch.time)} · ${rec?this._esc(rec.name):""}${med.notes?` · ${this._esc(med.notes)}`:""}</div>
          ${givenMeta ? `<div class="dose-meta">${givenMeta}</div>` : ""}
        </div>
        <div class="dose-actions">
          ${chips[status]}
          ${confirmBtn}
        </div>
      </div>`;
  }

  // ── Recipients ───────────────────────────────────────────────
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
              <div class="empty-msg">Add a pet or person to start tracking medications.</div>
            </div>` :
            `<div class="entity-list">
              ${recs.map(r=>`
                <div class="entity-row">
                  <div class="entity-avatar">${r.type==="person"?ICONS.person:ICONS.paw}</div>
                  <div class="entity-info">
                    <div class="entity-name">${this._esc(r.name)}</div>
                    <div class="entity-type">${r.type}</div>
                  </div>
                  <div class="entity-actions">
                    <button class="btn-icon" data-edit-rec="${r.id}">${ICONS.edit}</button>
                    <button class="btn-icon danger" data-del-rec="${r.id}">${ICONS.delete}</button>
                  </div>
                </div>`).join("")}
            </div>`}
        </div>
      </div>`;
  }

  // ── Medications ──────────────────────────────────────────────
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
                  ${rec.type==="person"?ICONS.person:ICONS.paw} ${this._esc(rec.name)}
                </div>
                ${ms.map(m => this._buildMedBlock(m)).join("")}`;
            }).join("")}
        </div>
      </div>`;
  }

  _buildMedBlock(med) {
    const xsClose = ICONS.close.replace('width="20"','width="12"').replace('height="20"','height="12"');
    const xsEdit  = ICONS.edit.replace('width="18"','width="12"').replace('height="18"','height="12"');

    const schChips = (med.schedules ?? []).map(s => {
      const rec = s.recurrence || { type: "daily" };
      const isDaily = rec.type === "daily";
      const notDue  = s.due_today === false ? ` <em style="opacity:.5;font-size:.7em">(not today)</em>` : "";
      return `
        <span class="sch-chip">
          ${ICONS.clock} ${this._esc(s.label ? `${s.label} (${fmt12hr(s.time)})` : fmt12hr(s.time))}
          ${!isDaily ? `<span class="rec-badge">${ICONS.repeat}${this._esc(recLabel(rec))}</span>` : ""}${notDue}
          <span class="sch-chip-actions">
            <button class="sch-chip-btn" data-edit-sch="${s.id}" data-edit-sch-med="${med.id}" title="Edit">${xsEdit}</button>
            <button class="sch-chip-btn del" data-del-sch="${s.id}" data-del-sch-med="${med.id}" title="Remove">${xsClose}</button>
          </span>
        </span>`;
    }).join("");

    const assignedSvcs = med.notify_services ?? [];
    const globalSvc    = this._config?.settings?.notify_service ?? "notify.notify";
    const notifyChips  = assignedSvcs.map(svc => `
      <span class="notify-chip">
        ${ICONS.bell} ${this._esc(svc)}
        <button class="notify-chip-btn" data-del-notify="${this._esc(svc)}" data-del-notify-med="${med.id}">${xsClose}</button>
      </span>`).join("");
    const available = this._notifyServices.filter(s => !assignedSvcs.includes(s));

    return `
      <div class="med-block" style="border-left-color:${med.color||"var(--primary-color)"}">
        <div class="med-block-header">
          <div class="med-name-row">
            <div class="color-dot" style="background:${med.color||"var(--primary-color)"}"></div>
            <span class="med-name">${this._esc(med.name)}</span>
          </div>
          <div class="entity-actions">
            <button class="btn-icon" data-edit-med="${med.id}">${ICONS.edit}</button>
            <button class="btn-icon danger" data-del-med="${med.id}">${ICONS.delete}</button>
          </div>
        </div>
        ${med.notes ? `<div class="med-notes">${this._esc(med.notes)}</div>` : ""}
        ${schChips
          ? `<div class="sch-chips">${schChips}</div>`
          : `<div class="med-notes" style="margin-bottom:6px">No schedule times yet.</div>`}
        <button class="btn-text" style="margin-bottom:8px" data-add-sch-med="${med.id}">${ICONS.add} Add schedule time</button>

        <div class="notify-section">
          <div class="section-sublabel">${ICONS.bell} Notifications</div>
          ${assignedSvcs.length
            ? `<div class="notify-chips">${notifyChips}</div>`
            : `<div class="notify-fallback">Using global default: ${this._esc(globalSvc)}</div>`}
          ${available.length ? `
            <div class="add-notify-row">
              <select class="add-notify-svc" data-med="${med.id}">
                <option value="">— select a service —</option>
                ${available.map(s=>`<option value="${this._esc(s)}">${this._esc(s)}</option>`).join("")}
              </select>
              <button class="btn-text add-notify" data-med="${med.id}">${ICONS.add} Add</button>
            </div>` : `<div class="notify-fallback" style="margin-top:4px">All available services already assigned.</div>`}
        </div>
      </div>`;
  }

  // ── Settings ─────────────────────────────────────────────────
  _buildSettings() {
    const s = this._config?.settings ?? {};
    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Notification Settings</span></div>
        <div class="card-body">
          <div class="form-row">
            <label class="form-label">Notify Service</label>
            <input type="text" id="ns-input" value="${this._esc(s.notify_service??"notify.notify")}" placeholder="notify.mobile_app_everyone" />
            <div class="settings-hint">The <code>notify.*</code> service used as the default for all medications unless overridden per medication.</div>
          </div>
          <div class="form-row">
            <label class="form-label">Reminder delay (minutes)</label>
            <input type="number" id="rm-input" value="${s.reminder_minutes??30}" style="max-width:80px" />
            <div class="settings-hint">A follow-up notification fires this many minutes after the scheduled time if the dose has not been confirmed.</div>
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

  // ── Wire ─────────────────────────────────────────────────────
  _wire() {
    const sd = this.shadowRoot;
    sd.querySelectorAll("[data-goto]").forEach(el =>
      el.addEventListener("click", () => this._switchTab(el.dataset.goto))
    );
    // Dashboard
    sd.querySelectorAll("[data-confirm-med]").forEach(btn =>
      btn.addEventListener("click", () => this._confirmDose(btn.dataset.confirmMed, btn.dataset.confirmSch))
    );
    sd.querySelectorAll("[data-edit-giver-med]").forEach(btn =>
      btn.addEventListener("click", () =>
        this._modalEditGiver(btn.dataset.editGiverMed, btn.dataset.editGiverSch, btn.dataset.editGiverDate, btn.dataset.editGiverBy)
      )
    );
    // Recipients
    sd.getElementById("add-rec")?.addEventListener("click", () => this._modalAddRecipient());
    sd.querySelectorAll("[data-edit-rec]").forEach(btn => btn.addEventListener("click", () => this._modalEditRecipient(btn.dataset.editRec)));
    sd.querySelectorAll("[data-del-rec]").forEach(btn => btn.addEventListener("click", () => this._deleteRecipient(btn.dataset.delRec)));
    // Medications
    sd.getElementById("add-med")?.addEventListener("click", () => this._modalAddMed());
    sd.querySelectorAll("[data-edit-med]").forEach(btn => btn.addEventListener("click", () => this._modalEditMed(btn.dataset.editMed)));
    sd.querySelectorAll("[data-del-med]").forEach(btn => btn.addEventListener("click", () => this._deleteMed(btn.dataset.delMed)));
    // Schedules
    sd.querySelectorAll("[data-add-sch-med]").forEach(btn =>
      btn.addEventListener("click", () => this._modalAddSchedule(btn.dataset.addSchMed))
    );
    sd.querySelectorAll("[data-edit-sch]").forEach(btn =>
      btn.addEventListener("click", () => {
        const medId = btn.dataset.editSchMed, schId = btn.dataset.editSch;
        const med = this._config?.medications?.find(m => m.id === medId);
        const sch = med?.schedules?.find(s => s.id === schId);
        if (sch) this._modalEditSchedule(medId, sch);
      })
    );
    sd.querySelectorAll("[data-del-sch]").forEach(btn =>
      btn.addEventListener("click", () => this._deleteSchedule(btn.dataset.delSchMed, btn.dataset.delSch))
    );
    // Notify services
    sd.querySelectorAll(".add-notify").forEach(btn =>
      btn.addEventListener("click", () => {
        const mid = btn.dataset.med;
        const svc = sd.querySelector(`.add-notify-svc[data-med="${mid}"]`)?.value;
        if (svc) this._addNotifyService(mid, svc);
      })
    );
    sd.querySelectorAll("[data-del-notify]").forEach(btn =>
      btn.addEventListener("click", () => this._removeNotifyService(btn.dataset.delNotifyMed, btn.dataset.delNotify))
    );
    // Settings
    sd.getElementById("save-settings")?.addEventListener("click", () => {
      const ns = sd.getElementById("ns-input")?.value?.trim();
      const rm = parseInt(sd.getElementById("rm-input")?.value) || 30;
      this._saveSettings(ns, rm);
    });
    sd.getElementById("reset-all")?.addEventListener("click", () => this._resetAll());
  }

  // ── Modals ────────────────────────────────────────────────────
  _modal(title, bodyHtml, onSave, saveLabel = "Save", onRender = null) {
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
    setTimeout(() => {
      ov.querySelectorAll(".swatch").forEach(sw =>
        sw.addEventListener("click", () => {
          ov.querySelectorAll(".swatch").forEach(s => s.classList.remove("sel"));
          sw.classList.add("sel");
          ov.querySelector("#m-color").value = sw.dataset.color;
        })
      );
      if (onRender) onRender(ov);
    }, 0);
  }

  _colorPicker(current) {
    return `
      <div class="color-row">
        ${PALETTE.map(c=>`<div class="swatch${c===(current||PALETTE[5])?" sel":""}" style="background:${c}" data-color="${c}" tabindex="0"></div>`).join("")}
      </div>
      <input type="hidden" id="m-color" value="${current||PALETTE[5]}" />`;
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
        await this._api("POST","meds_tracker/recipients",{name,type,icon:type==="person"?"mdi:account":"mdi:paw"});
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
          <option value="pet"${r.type==="pet"?" selected":""}>Pet</option>
          <option value="person"${r.type==="person"?" selected":""}>Person</option>
        </select>
      </div>`, async ov => {
        const name = ov.querySelector("#m-name")?.value?.trim();
        const type = ov.querySelector("#m-type")?.value;
        if (!name) return;
        await this._api("PUT",`meds_tracker/recipients/${id}`,{name,type});
        await this._fetch(); this._renderContent();
    });
  }

  _modalAddMed() {
    const recs = this._config?.recipients ?? [];
    this._modal("Add Medication", `
      <div class="form-row">
        <label class="form-label">Recipient</label>
        <select id="m-rec">${recs.map(r=>`<option value="${r.id}">${this._esc(r.name)}</option>`).join("")}</select>
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
        await this._api("POST","meds_tracker/medications",{recipient_id:rec_id,name,notes,color});
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
        <input type="text" id="m-notes" value="${this._esc(m.notes||"")}" />
      </div>
      <div class="form-row">
        <label class="form-label">Colour</label>
        ${this._colorPicker(m.color)}
      </div>`, async ov => {
        const name  = ov.querySelector("#m-name")?.value?.trim();
        const notes = ov.querySelector("#m-notes")?.value?.trim();
        const color = ov.querySelector("#m-color")?.value;
        if (!name) return;
        await this._api("PUT",`meds_tracker/medications/${id}`,{name,notes,color});
        await this._fetch(); this._renderContent();
    });
  }

  _modalAddSchedule(medId) {
    this._modal("Add Schedule Time", `
      <div class="form-row">
        <label class="form-label">Time</label>
        ${buildTimePicker("add_sch","08:00")}
      </div>
      <div class="form-row">
        <label class="form-label">Label (optional)</label>
        <input type="text" id="m-sch-label" placeholder="Morning, Evening…" autofocus />
      </div>
      ${buildRecurrenceForm("add_sch", null)}
      `, async ov => {
        const time  = readTimePicker(ov, "add_sch");
        const label = ov.querySelector("#m-sch-label")?.value?.trim() ?? "";
        const rec   = readRecurrence(ov, "add_sch");
        if (!time) return;
        await this._api("POST",`meds_tracker/medications/${medId}/schedules`,{time,label,recurrence:rec});
        await this._fetch(); this._renderContent();
    }, "Add", ov => wireRecurrenceToggle(ov, "add_sch"));
  }

  _modalEditSchedule(medId, sch) {
    this._modal("Edit Schedule Time", `
      <div class="form-row">
        <label class="form-label">Time</label>
        ${buildTimePicker("edit_sch", sch.time)}
      </div>
      <div class="form-row">
        <label class="form-label">Label (optional)</label>
        <input type="text" id="m-sch-label" value="${this._esc(sch.label||"")}" placeholder="Morning, Evening…" autofocus />
      </div>
      ${buildRecurrenceForm("edit_sch", sch.recurrence)}
      `, async ov => {
        const newTime  = readTimePicker(ov, "edit_sch");
        const newLabel = ov.querySelector("#m-sch-label")?.value?.trim() ?? "";
        const rec      = readRecurrence(ov, "edit_sch");
        if (!newTime) return;
        await this._api("DELETE",`meds_tracker/medications/${medId}/schedules/${sch.id}`);
        await this._api("POST",  `meds_tracker/medications/${medId}/schedules`,{time:newTime,label:newLabel,recurrence:rec});
        await this._fetch(); this._renderContent();
    }, "Save", ov => wireRecurrenceToggle(ov, "edit_sch"));
  }

  _modalEditGiver(medId, schId, dateStr, currentBy) {
    const userOptions = this._haUsers.length
      ? this._haUsers.map(u => `<option value="${this._esc(u)}"${u===currentBy?" selected":""}>${this._esc(u)}</option>`).join("")
      : "";

    this._modal("Edit Who Gave This Dose", `
      <div class="form-row">
        <label class="form-label">Given by</label>
        ${userOptions
          ? `<select id="m-giver">
               <option value="">— select —</option>
               ${userOptions}
               <option value="__custom__">Enter manually…</option>
             </select>`
          : ""}
        <input type="text" id="m-giver-text" value="${this._esc(currentBy)}"
          placeholder="Name"${userOptions ? ' style="margin-top:6px"' : " autofocus"} />
      </div>`, async ov => {
        let by = ov.querySelector("#m-giver-text")?.value?.trim() ?? "";
        const sel = ov.querySelector("#m-giver")?.value;
        if (sel && sel !== "__custom__") by = sel;
        await this._updateConfirmedBy(medId, schId, dateStr, by);
    }, "Save", ov => {
        // Auto-populate text field when dropdown changes
        ov.querySelector("#m-giver")?.addEventListener("change", e => {
          const txt = ov.querySelector("#m-giver-text");
          if (e.target.value && e.target.value !== "__custom__") txt.value = e.target.value;
          if (e.target.value === "__custom__") { txt.value = ""; txt.focus(); }
        });
    });
  }

  // ── Actions ───────────────────────────────────────────────────
  async _confirmDose(medId, schId) {
    await this._api("POST","meds_tracker/doses/confirm",{medication_id:medId,schedule_id:schId,confirmed_by:this._hass?.user?.name??""});
    await this._fetch(); this._renderContent();
  }

  async _updateConfirmedBy(medId, schId, dateStr, by) {
    await this._api("PUT","meds_tracker/doses/update",{medication_id:medId,schedule_id:schId,date:dateStr,confirmed_by:by});
    await this._fetch(); this._renderContent();
  }

  async _deleteRecipient(id) {
    const r = this._config?.recipients?.find(x=>x.id===id);
    if (!confirm(`Delete "${r?.name}" and all their medications? This cannot be undone.`)) return;
    await this._api("DELETE",`meds_tracker/recipients/${id}`);
    await this._fetch(); this._renderContent();
  }

  async _deleteMed(id) {
    const m = this._config?.medications?.find(x=>x.id===id);
    if (!confirm(`Delete "${m?.name}"? This cannot be undone.`)) return;
    await this._api("DELETE",`meds_tracker/medications/${id}`);
    await this._fetch(); this._renderContent();
  }

  async _deleteSchedule(medId, schId) {
    await this._api("DELETE",`meds_tracker/medications/${medId}/schedules/${schId}`);
    await this._fetch(); this._renderContent();
  }

  async _addNotifyService(medId, svc) {
    const med = this._config?.medications?.find(m=>m.id===medId);
    if (!med) return;
    const services = [...(med.notify_services??[])];
    if (services.includes(svc)) return;
    services.push(svc);
    await this._api("PUT",`meds_tracker/medications/${medId}`,{notify_services:services});
    await this._fetch(); this._renderContent();
  }

  async _removeNotifyService(medId, svc) {
    const med = this._config?.medications?.find(m=>m.id===medId);
    if (!med) return;
    const services = (med.notify_services??[]).filter(s=>s!==svc);
    await this._api("PUT",`meds_tracker/medications/${medId}`,{notify_services:services});
    await this._fetch(); this._renderContent();
  }

  async _saveSettings(ns, rm) {
    await this._api("PUT","meds_tracker/settings",{notify_service:ns,reminder_minutes:rm});
    await this._fetch(); this._renderContent();
    const btn = this.shadowRoot.getElementById("save-settings");
    if (btn) { btn.textContent="Saved"; setTimeout(()=>{ btn.textContent="Save settings"; },2000); }
  }

  async _resetAll() {
    if (!confirm("Delete ALL data? This cannot be undone.")) return;
    for (const r of (this._config?.recipients??[]))
      await this._api("DELETE",`meds_tracker/recipients/${r.id}`);
    await this._fetch(); this._renderContent();
  }

  // ── State helpers ─────────────────────────────────────────────
  _doseStatus(medId, schId, time) {
    if (this._doseEntry(medId,schId)) return "confirmed";
    const now = new Date();
    try {
      const [h,m] = time.split(":").map(Number);
      if (now.getHours()>h||(now.getHours()===h&&now.getMinutes()>=m+1)) return "missed";
    } catch(_) {}
    return "pending";
  }
  _doseEntry(medId, schId) { return this._doses.find(d=>d.medication_id===medId&&d.schedule_id===schId); }
  _esc(s) { return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
}

customElements.define("meds-tracker-panel", MedsTrackerPanel);
