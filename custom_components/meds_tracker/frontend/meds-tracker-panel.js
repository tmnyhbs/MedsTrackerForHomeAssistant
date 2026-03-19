/**
 * Meds Tracker — Home Assistant Custom Panel
 * Single-file web component. No external dependencies.
 * Communicates with the Python backend via hass.callApi().
 */

const PALETTE = [
  "#e74c3c", "#e67e22", "#f39c12", "#2ecc71",
  "#1abc9c", "#3498db", "#9b59b6", "#e91e63",
];

// ──────────────────────────────────────────────────────────────
//  Styles
// ──────────────────────────────────────────────────────────────

const CSS = /* css */`
  :host {
    display: block;
    height: 100%;
    background: var(--primary-background-color, #111827);
    color: var(--primary-text-color, #f1f5f9);
    font-family: var(--paper-font-body1_-_font-family, ui-sans-serif, system-ui, sans-serif);
    font-size: 14px;
  }

  * { box-sizing: border-box; }

  /* ── Layout ── */
  .app { display: flex; flex-direction: column; height: 100%; }

  .top-bar {
    display: flex; align-items: center; gap: 10px;
    padding: 0 20px;
    height: 56px;
    background: var(--app-header-background-color, #1e293b);
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .top-bar h1 { margin: 0; font-size: 1.1rem; font-weight: 600; }
  .top-bar-icon { font-size: 1.4rem; }

  .tabs {
    display: flex;
    background: var(--card-background-color, #1e293b);
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    flex-shrink: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .tab {
    padding: 0 20px;
    height: 48px;
    display: flex; align-items: center;
    cursor: pointer;
    font-size: 0.875rem; font-weight: 500;
    color: var(--secondary-text-color, #94a3b8);
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color .15s, border-color .15s;
    user-select: none;
  }
  .tab:hover { color: var(--primary-text-color, #f1f5f9); }
  .tab.active {
    color: var(--primary-color, #38bdf8);
    border-bottom-color: var(--primary-color, #38bdf8);
  }

  .content {
    flex: 1; overflow-y: auto;
    padding: 20px;
  }

  /* ── Cards ── */
  .card {
    background: var(--card-background-color, #1e293b);
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 16px;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.07));
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .card-title { font-size: 0.95rem; font-weight: 600; }

  /* ── Buttons ── */
  button { cursor: pointer; font-family: inherit; transition: opacity .15s; }
  button:hover { opacity: .85; }

  .btn {
    padding: 7px 16px; border-radius: 8px; border: none;
    font-size: 0.8rem; font-weight: 600;
  }
  .btn-primary { background: var(--primary-color, #38bdf8); color: #0f172a; }
  .btn-danger  { background: #ef4444; color: #fff; }
  .btn-ghost {
    background: transparent; color: var(--secondary-text-color, #94a3b8);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.15));
  }
  .btn-sm { padding: 5px 12px; font-size: 0.75rem; }
  .btn-icon {
    background: transparent; border: none;
    padding: 4px 7px; border-radius: 6px;
    color: var(--secondary-text-color, #94a3b8);
    font-size: 0.95rem;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.08); }

  /* ── Forms ── */
  .form-row { margin-bottom: 14px; }
  .form-label {
    display: block; font-size: 0.75rem; font-weight: 600;
    color: var(--secondary-text-color, #94a3b8);
    text-transform: uppercase; letter-spacing: .04em;
    margin-bottom: 5px;
  }
  input[type=text], input[type=time], select, textarea {
    width: 100%; padding: 9px 12px;
    background: var(--secondary-background-color, #0f172a);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    border-radius: 8px;
    color: var(--primary-text-color, #f1f5f9);
    font-size: 0.875rem; font-family: inherit;
    outline: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--primary-color, #38bdf8);
  }
  input::placeholder { color: var(--secondary-text-color, #64748b); }

  /* ── Color picker ── */
  .color-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .swatch {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid transparent; cursor: pointer;
    transition: transform .15s, border-color .15s;
  }
  .swatch.sel { border-color: #fff; transform: scale(1.2); }

  /* ── Section headers ── */
  .section-hd {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .07em; color: var(--secondary-text-color, #64748b);
    margin: 0 0 8px;
  }

  /* ── Summary chips ── */
  .summary-row { display: flex; gap: 10px; margin-bottom: 18px; }
  .summary-chip {
    flex: 1; text-align: center; padding: 14px 8px;
    background: var(--secondary-background-color, #0f172a);
    border-radius: 10px;
  }
  .summary-num { font-size: 1.8rem; font-weight: 700; line-height: 1; }
  .c-green  { color: #4ade80; }
  .c-yellow { color: #facc15; }
  .c-red    { color: #f87171; }
  .summary-label { font-size: 0.7rem; color: var(--secondary-text-color, #94a3b8); margin-top: 3px; }

  /* ── Dose cards ── */
  .dose-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
  .dose-card {
    background: var(--secondary-background-color, #0f172a);
    border-radius: 10px; padding: 14px;
    border-left: 4px solid #3b82f6;
  }
  .dose-card.confirmed { border-left-color: #4ade80; }
  .dose-card.missed    { border-left-color: #f87171; }
  .dose-card.pending   { border-left-color: #facc15; }

  .dose-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .dose-name { font-weight: 600; font-size: 0.95rem; }
  .dose-recip { font-size: 0.75rem; color: var(--secondary-text-color, #94a3b8); }
  .dose-time { font-size: 0.78rem; color: var(--secondary-text-color, #94a3b8); margin: 4px 0; }
  .dose-notes { font-size: 0.78rem; color: var(--secondary-text-color, #94a3b8); font-style: italic; margin-bottom: 6px; }
  .dose-meta  { font-size: 0.72rem; color: var(--secondary-text-color, #64748b); margin-top: 6px; }

  .badge {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 9px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700; white-space: nowrap;
  }
  .badge-pending   { background: rgba(250,204,21,.15);  color: #facc15; }
  .badge-confirmed { background: rgba(74,222,128,.15);  color: #4ade80; }
  .badge-missed    { background: rgba(248,113,113,.15); color: #f87171; }

  /* ── List items ── */
  .list-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px;
    background: var(--secondary-background-color, #0f172a);
    border-radius: 8px; margin-bottom: 8px;
  }
  .list-item-left { display: flex; align-items: center; gap: 10px; }
  .avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(56,189,248,.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.15rem; flex-shrink: 0;
  }
  .item-name  { font-weight: 500; font-size: 0.9rem; }
  .item-sub   { font-size: 0.75rem; color: var(--secondary-text-color, #94a3b8); }
  .item-actions { display: flex; gap: 2px; }

  /* ── Medication block ── */
  .med-block {
    padding: 12px;
    background: var(--secondary-background-color, #0f172a);
    border-radius: 8px; margin-bottom: 8px;
    border-left: 3px solid #3b82f6;
  }
  .med-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .med-name-row { display: flex; align-items: center; gap: 6px; }
  .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .med-name { font-weight: 600; }
  .med-notes { font-size: 0.78rem; color: var(--secondary-text-color, #94a3b8); margin-bottom: 8px; }

  .sch-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .sch-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    background: rgba(56,189,248,.12); color: var(--primary-color, #38bdf8);
    font-size: 0.78rem;
  }
  .sch-remove {
    background: none; border: none; cursor: pointer;
    color: var(--secondary-text-color, #94a3b8);
    font-size: 0.7rem; padding: 0 2px; line-height: 1;
  }
  .sch-remove:hover { color: #f87171; }

  .add-sch-row { display: flex; gap: 6px; align-items: center; margin-top: 4px; }
  .add-sch-row input[type=time] { max-width: 130px; }
  .add-sch-row input[type=text] { flex: 1; }

  /* ── Settings ── */
  .danger-card { border-color: rgba(239,68,68,.3); }

  /* ── Empty state ── */
  .empty {
    text-align: center; padding: 48px 20px;
    color: var(--secondary-text-color, #64748b);
  }
  .empty-icon { font-size: 2.8rem; margin-bottom: 10px; }
  .empty-msg  { font-size: 0.9rem; margin-bottom: 16px; line-height: 1.5; }

  /* ── Modal ── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.72);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 16px;
  }
  .modal {
    background: var(--card-background-color, #1e293b);
    border-radius: 16px; padding: 24px;
    width: 100%; max-width: 420px;
    max-height: 90vh; overflow-y: auto;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.08));
  }
  .modal-title { font-size: 1rem; font-weight: 600; margin-bottom: 18px; }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

  /* ── Loading ── */
  .loading { display: flex; align-items: center; justify-content: center; height: 160px; }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid rgba(255,255,255,.1);
    border-top-color: var(--primary-color, #38bdf8);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  small {
    display: block; font-size: 0.72rem;
    color: var(--secondary-text-color, #64748b);
    margin-top: 4px; line-height: 1.4;
  }

  .group-label {
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .06em; color: var(--secondary-text-color, #64748b);
    margin: 12px 0 6px; display: flex; align-items: center; gap: 6px;
  }
`;

// ──────────────────────────────────────────────────────────────
//  Panel element
// ──────────────────────────────────────────────────────────────

class MedsTrackerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass       = null;
    this._config     = null;   // { recipients, medications, settings }
    this._doses      = [];     // today's dose log
    this._tab        = "dashboard";
    this._loading    = true;
    this._unsub      = null;
    this._booted     = false;
  }

  // ── HA lifecycle ──────────────────────────────────────────

  connectedCallback() {
    if (this._hass && !this._booted) this._boot();
  }

  disconnectedCallback() {
    if (this._unsub) { this._unsub(); this._unsub = null; }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._booted) this._boot();
  }

  // ── Init ──────────────────────────────────────────────────

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
      const [cfg, doses] = await Promise.all([
        this._api("GET", "meds_tracker/config"),
        this._api("GET", "meds_tracker/doses/today"),
      ]);
      this._config = cfg;
      this._doses  = doses || [];
    } catch (e) {
      console.error("[MedsTracker] fetch error", e);
      this._config = { recipients: [], medications: [], settings: {} };
      this._doses  = [];
    }
  }

  async _api(method, path, body) {
    return this._hass.callApi(method, path, body);
  }

  _subscribeEvents() {
    this._hass.connection
      .subscribeEvents(async () => {
        await this._fetch();
        this._renderContent();
      }, "meds_tracker_update")
      .then(unsub => { this._unsub = unsub; })
      .catch(() => {});
  }

  // ── Shell (tabs + top bar — rendered once) ────────────────

  _renderShell() {
    const sd = this.shadowRoot;
    sd.innerHTML = `
      <style>${CSS}</style>
      <div class="app">
        <div class="top-bar">
          <span class="top-bar-icon">💊</span>
          <h1>Meds Tracker</h1>
        </div>
        <div class="tabs">
          ${["dashboard","recipients","medications","settings"].map(t => `
            <div class="tab${t === this._tab ? " active" : ""}" data-tab="${t}">
              ${{ dashboard:"Dashboard", recipients:"Recipients", medications:"Medications", settings:"Settings" }[t]}
            </div>
          `).join("")}
        </div>
        <div class="content" id="content">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    `;
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

  // ── Content router ────────────────────────────────────────

  _renderContent() {
    const el = this.shadowRoot.getElementById("content");
    if (!el) return;
    if (this._loading) {
      el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
      return;
    }
    const html = {
      dashboard:   () => this._buildDashboard(),
      recipients:  () => this._buildRecipients(),
      medications: () => this._buildMedications(),
      settings:    () => this._buildSettings(),
    }[this._tab]?.() ?? "";
    el.innerHTML = html;
    this._wire();
  }

  // ── Dashboard ─────────────────────────────────────────────

  _buildDashboard() {
    const meds = this._config?.medications ?? [];
    const recs = this._config?.recipients  ?? [];
    const items = [];

    for (const med of meds) {
      const rec = recs.find(r => r.id === med.recipient_id);
      for (const sch of (med.schedules ?? [])) {
        const status = this._doseStatus(med.id, sch.id, sch.time);
        const dose   = this._doseEntry(med.id, sch.id);
        items.push({ med, sch, rec, status, dose });
      }
    }

    if (items.length === 0) return `
      <div class="empty">
        <div class="empty-icon">📋</div>
        <div class="empty-msg">No medications scheduled yet.<br>Add recipients &amp; medications to get started.</div>
        <button class="btn btn-primary" data-goto="recipients">Get Started →</button>
      </div>`;

    const order = { pending: 0, missed: 1, confirmed: 2 };
    items.sort((a, b) => order[a.status] - order[b.status]);

    const confirmed = items.filter(i => i.status === "confirmed").length;
    const pending   = items.filter(i => i.status === "pending").length;
    const missed    = items.filter(i => i.status === "missed").length;

    return `
      <div class="summary-row">
        <div class="summary-chip">
          <div class="summary-num c-green">${confirmed}</div>
          <div class="summary-label">Given</div>
        </div>
        <div class="summary-chip">
          <div class="summary-num c-yellow">${pending}</div>
          <div class="summary-label">Pending</div>
        </div>
        <div class="summary-chip">
          <div class="summary-num c-red">${missed}</div>
          <div class="summary-label">Missed</div>
        </div>
      </div>
      <div class="dose-grid">
        ${items.map(i => this._buildDoseCard(i)).join("")}
      </div>`;
  }

  _buildDoseCard({ med, sch, rec, status, dose }) {
    const labels  = { pending: "⏳ Pending", confirmed: "✅ Given", missed: "❌ Missed" };
    const confirmBtn = status !== "confirmed"
      ? `<button class="btn btn-primary btn-sm" style="margin-top:8px"
             data-confirm-med="${med.id}" data-confirm-sch="${sch.id}">Mark Given</button>`
      : "";
    const meta = dose ? `
      <div class="dose-meta">
        Given at ${new Date(dose.confirmed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        ${dose.confirmed_by ? ` by ${this._esc(dose.confirmed_by)}` : ""}
      </div>` : "";

    return `
      <div class="dose-card ${status}" style="border-left-color:${med.color || "#3b82f6"}">
        <div class="dose-top">
          <div>
            <div class="dose-name">${this._esc(med.name)}</div>
            <div class="dose-recip">${rec ? this._esc(rec.name) : ""}</div>
          </div>
          <span class="badge badge-${status}">${labels[status]}</span>
        </div>
        <div class="dose-time">🕐 ${this._esc(sch.label || sch.time)}${sch.label ? ` (${sch.time})` : ""}</div>
        ${med.notes ? `<div class="dose-notes">${this._esc(med.notes)}</div>` : ""}
        ${meta}
        ${confirmBtn}
      </div>`;
  }

  _doseStatus(medId, schId, time) {
    if (this._doseEntry(medId, schId)) return "confirmed";
    const now = new Date();
    try {
      const [h, m] = time.split(":").map(Number);
      if (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m + 1))
        return "missed";
    } catch (_) {}
    return "pending";
  }

  _doseEntry(medId, schId) {
    return this._doses.find(d => d.medication_id === medId && d.schedule_id === schId);
  }

  // ── Recipients ────────────────────────────────────────────

  _buildRecipients() {
    const recs = this._config?.recipients ?? [];
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recipients</span>
          <button class="btn btn-primary btn-sm" id="add-rec">+ Add</button>
        </div>
        ${recs.length === 0 ? `
          <div class="empty" style="padding:24px">
            <div class="empty-icon">👤</div>
            <div class="empty-msg">No recipients yet.<br>Add a pet or person to start tracking their meds.</div>
          </div>` :
          recs.map(r => `
            <div class="list-item">
              <div class="list-item-left">
                <div class="avatar">${r.type === "person" ? "👤" : "🐾"}</div>
                <div>
                  <div class="item-name">${this._esc(r.name)}</div>
                  <div class="item-sub">${r.type}</div>
                </div>
              </div>
              <div class="item-actions">
                <button class="btn-icon" data-edit-rec="${r.id}" title="Edit">✏️</button>
                <button class="btn-icon" data-del-rec="${r.id}" title="Delete">🗑️</button>
              </div>
            </div>`).join("")}
      </div>`;
  }

  // ── Medications ───────────────────────────────────────────

  _buildMedications() {
    const recs = this._config?.recipients  ?? [];
    const meds = this._config?.medications ?? [];

    if (recs.length === 0) return `
      <div class="empty">
        <div class="empty-icon">💊</div>
        <div class="empty-msg">Add at least one recipient before adding medications.</div>
        <button class="btn btn-primary" data-goto="recipients">Add Recipient →</button>
      </div>`;

    const byRec = recs.map(r => ({
      rec: r,
      meds: meds.filter(m => m.recipient_id === r.id),
    })).filter(g => g.meds.length > 0 || true); // show all recipients

    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Medications</span>
          <button class="btn btn-primary btn-sm" id="add-med">+ Add</button>
        </div>
        ${meds.length === 0 ? `
          <div class="empty" style="padding:24px">
            <div class="empty-icon">💊</div>
            <div class="empty-msg">No medications yet. Click + Add to create one.</div>
          </div>` :
          byRec.map(({ rec, meds: ms }) => ms.length === 0 ? "" : `
            <div class="group-label">${rec.type === "person" ? "👤" : "🐾"} ${this._esc(rec.name)}</div>
            ${ms.map(m => this._buildMedBlock(m)).join("")}
          `).join("")}
      </div>`;
  }

  _buildMedBlock(med) {
    const chips = (med.schedules ?? []).map(s => `
      <span class="sch-chip">
        🕐 ${this._esc(s.label || s.time)}
        <button class="sch-remove" data-del-sch="${s.id}" data-del-sch-med="${med.id}" title="Remove">✕</button>
      </span>`).join("");

    return `
      <div class="med-block" style="border-left-color:${med.color || "#3b82f6"}">
        <div class="med-header">
          <div class="med-name-row">
            <div class="color-dot" style="background:${med.color || "#3b82f6"}"></div>
            <span class="med-name">${this._esc(med.name)}</span>
          </div>
          <div class="item-actions">
            <button class="btn-icon" data-edit-med="${med.id}" title="Edit">✏️</button>
            <button class="btn-icon" data-del-med="${med.id}" title="Delete">🗑️</button>
          </div>
        </div>
        ${med.notes ? `<div class="med-notes">${this._esc(med.notes)}</div>` : ""}
        <div class="sch-chips">${chips}</div>
        <div class="add-sch-row">
          <input type="time" class="sch-time" data-med="${med.id}" />
          <input type="text" class="sch-label" data-med="${med.id}" placeholder="Label (optional)" />
          <button class="btn btn-ghost btn-sm add-sch" data-med="${med.id}">+ Time</button>
        </div>
      </div>`;
  }

  // ── Settings ──────────────────────────────────────────────

  _buildSettings() {
    const s = this._config?.settings ?? {};
    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Notifications</span></div>
        <div class="form-row">
          <label class="form-label">Notify Service</label>
          <input type="text" id="ns-input" value="${this._esc(s.notify_service ?? "notify.notify")}"
                 placeholder="notify.mobile_app_everyone" />
          <small>The HA <code>notify.*</code> service used to send reminders to phones.</small>
        </div>
        <div class="form-row">
          <label class="form-label">Send reminder after (minutes)</label>
          <input type="text" id="rm-input" value="${s.reminder_minutes ?? 30}"
                 style="max-width:90px" placeholder="30" />
          <small>A follow-up notification fires this many minutes after the scheduled time if the dose hasn't been confirmed.</small>
        </div>
        <button class="btn btn-primary" id="save-settings">Save Settings</button>
      </div>

      <div class="card danger-card">
        <div class="card-header">
          <span class="card-title" style="color:#f87171">⚠️ Danger Zone</span>
        </div>
        <p style="font-size:.875rem;color:var(--secondary-text-color,#94a3b8);margin:0 0 12px">
          Permanently deletes all recipients, medications, schedules, and history.
        </p>
        <button class="btn btn-danger" id="reset-all">Reset All Data</button>
      </div>`;
  }

  // ── Wire event handlers after innerHTML swap ──────────────

  _wire() {
    const sd = this.shadowRoot;

    // "Get Started / go to tab" buttons
    sd.querySelectorAll("[data-goto]").forEach(el =>
      el.addEventListener("click", () => this._switchTab(el.dataset.goto))
    );

    // Dashboard: confirm
    sd.querySelectorAll("[data-confirm-med]").forEach(btn =>
      btn.addEventListener("click", () =>
        this._confirmDose(btn.dataset.confirmMed, btn.dataset.confirmSch)
      )
    );

    // Recipients
    sd.getElementById("add-rec")?.addEventListener("click", () => this._modalAddRecipient());
    sd.querySelectorAll("[data-edit-rec]").forEach(btn =>
      btn.addEventListener("click", () => this._modalEditRecipient(btn.dataset.editRec))
    );
    sd.querySelectorAll("[data-del-rec]").forEach(btn =>
      btn.addEventListener("click", () => this._deleteRecipient(btn.dataset.delRec))
    );

    // Medications
    sd.getElementById("add-med")?.addEventListener("click", () => this._modalAddMed());
    sd.querySelectorAll("[data-edit-med]").forEach(btn =>
      btn.addEventListener("click", () => this._modalEditMed(btn.dataset.editMed))
    );
    sd.querySelectorAll("[data-del-med]").forEach(btn =>
      btn.addEventListener("click", () => this._deleteMed(btn.dataset.delMed))
    );

    // Schedules
    sd.querySelectorAll(".add-sch").forEach(btn =>
      btn.addEventListener("click", () => {
        const mid   = btn.dataset.med;
        const time  = sd.querySelector(`.sch-time[data-med="${mid}"]`)?.value;
        const label = sd.querySelector(`.sch-label[data-med="${mid}"]`)?.value ?? "";
        if (time) this._addSchedule(mid, time, label);
      })
    );
    sd.querySelectorAll("[data-del-sch]").forEach(btn =>
      btn.addEventListener("click", () =>
        this._deleteSchedule(btn.dataset.delSchMed, btn.dataset.delSch)
      )
    );

    // Settings
    sd.getElementById("save-settings")?.addEventListener("click", () => {
      const ns = sd.getElementById("ns-input")?.value?.trim();
      const rm = parseInt(sd.getElementById("rm-input")?.value) || 30;
      this._saveSettings(ns, rm);
    });
    sd.getElementById("reset-all")?.addEventListener("click", () => this._resetAll());
  }

  // ── Modals ────────────────────────────────────────────────

  _modal(html, onSubmit) {
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `<div class="modal">${html}</div>`;
    this.shadowRoot.appendChild(ov);

    ov.querySelector("[data-cancel]")?.addEventListener("click", () => ov.remove());
    ov.querySelector("[data-ok]")?.addEventListener("click", async () => {
      await onSubmit(ov);
      ov.remove();
    });
    ov.addEventListener("click", e => { if (e.target === ov) ov.remove(); });

    // Color picker wiring
    setTimeout(() => {
      ov.querySelectorAll(".swatch").forEach(sw => {
        sw.addEventListener("click", () => {
          ov.querySelectorAll(".swatch").forEach(s => s.classList.remove("sel"));
          sw.classList.add("sel");
          ov.querySelector("#m-color").value = sw.dataset.color;
        });
      });
    }, 0);
  }

  _colorPicker(current) {
    return `
      <div class="color-row">
        ${PALETTE.map(c => `
          <div class="swatch${c === current ? " sel" : ""}"
               style="background:${c}" data-color="${c}"></div>`).join("")}
      </div>
      <input type="hidden" id="m-color" value="${current || PALETTE[5]}" />`;
  }

  _modalAddRecipient() {
    this._modal(`
      <div class="modal-title">Add Recipient</div>
      <div class="form-row">
        <label class="form-label">Name</label>
        <input type="text" id="m-name" placeholder="Bun, Alice…" />
      </div>
      <div class="form-row">
        <label class="form-label">Type</label>
        <select id="m-type">
          <option value="pet">🐾 Pet</option>
          <option value="person">👤 Person</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-cancel>Cancel</button>
        <button class="btn btn-primary" data-ok>Add</button>
      </div>`, async ov => {
        const name = ov.querySelector("#m-name")?.value?.trim();
        const type = ov.querySelector("#m-type")?.value;
        if (!name) return;
        await this._api("POST", "meds_tracker/recipients", {
          name, type, icon: type === "person" ? "mdi:account" : "mdi:paw",
        });
        await this._fetch(); this._renderContent();
    });
  }

  _modalEditRecipient(id) {
    const r = this._config?.recipients?.find(x => x.id === id);
    if (!r) return;
    this._modal(`
      <div class="modal-title">Edit Recipient</div>
      <div class="form-row">
        <label class="form-label">Name</label>
        <input type="text" id="m-name" value="${this._esc(r.name)}" />
      </div>
      <div class="form-row">
        <label class="form-label">Type</label>
        <select id="m-type">
          <option value="pet"   ${r.type === "pet"    ? "selected" : ""}>🐾 Pet</option>
          <option value="person"${r.type === "person" ? "selected" : ""}>👤 Person</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-cancel>Cancel</button>
        <button class="btn btn-primary" data-ok>Save</button>
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
    this._modal(`
      <div class="modal-title">Add Medication</div>
      <div class="form-row">
        <label class="form-label">Recipient</label>
        <select id="m-rec">
          ${recs.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}
        </select>
      </div>
      <div class="form-row">
        <label class="form-label">Medication Name</label>
        <input type="text" id="m-name" placeholder="Metacam, Amoxicillin…" />
      </div>
      <div class="form-row">
        <label class="form-label">Notes / Dosage</label>
        <input type="text" id="m-notes" placeholder="0.3ml with food" />
      </div>
      <div class="form-row">
        <label class="form-label">Colour</label>
        ${this._colorPicker(PALETTE[5])}
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-cancel>Cancel</button>
        <button class="btn btn-primary" data-ok>Add</button>
      </div>`, async ov => {
        const rec_id = ov.querySelector("#m-rec")?.value;
        const name   = ov.querySelector("#m-name")?.value?.trim();
        const notes  = ov.querySelector("#m-notes")?.value?.trim();
        const color  = ov.querySelector("#m-color")?.value;
        if (!name || !rec_id) return;
        await this._api("POST", "meds_tracker/medications", {
          recipient_id: rec_id, name, notes, color,
        });
        await this._fetch(); this._renderContent();
    });
  }

  _modalEditMed(id) {
    const m = this._config?.medications?.find(x => x.id === id);
    if (!m) return;
    this._modal(`
      <div class="modal-title">Edit Medication</div>
      <div class="form-row">
        <label class="form-label">Name</label>
        <input type="text" id="m-name" value="${this._esc(m.name)}" />
      </div>
      <div class="form-row">
        <label class="form-label">Notes / Dosage</label>
        <input type="text" id="m-notes" value="${this._esc(m.notes || "")}" />
      </div>
      <div class="form-row">
        <label class="form-label">Colour</label>
        ${this._colorPicker(m.color || PALETTE[5])}
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-cancel>Cancel</button>
        <button class="btn btn-primary" data-ok>Save</button>
      </div>`, async ov => {
        const name  = ov.querySelector("#m-name")?.value?.trim();
        const notes = ov.querySelector("#m-notes")?.value?.trim();
        const color = ov.querySelector("#m-color")?.value;
        if (!name) return;
        await this._api("PUT", `meds_tracker/medications/${id}`, { name, notes, color });
        await this._fetch(); this._renderContent();
    });
  }

  // ── Actions ───────────────────────────────────────────────

  async _confirmDose(medId, schId) {
    try {
      await this._api("POST", "meds_tracker/doses/confirm", {
        medication_id: medId,
        schedule_id:   schId,
        confirmed_by:  this._hass?.user?.name ?? "",
      });
      await this._fetch();
      this._renderContent();
    } catch (e) { console.error("[MedsTracker] confirm error", e); }
  }

  async _deleteRecipient(id) {
    const r = this._config?.recipients?.find(x => x.id === id);
    if (!confirm(`Delete "${r?.name ?? "recipient"}" and all their medications? This cannot be undone.`)) return;
    await this._api("DELETE", `meds_tracker/recipients/${id}`);
    await this._fetch(); this._renderContent();
  }

  async _deleteMed(id) {
    const m = this._config?.medications?.find(x => x.id === id);
    if (!confirm(`Delete "${m?.name ?? "medication"}"? This cannot be undone.`)) return;
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

  async _saveSettings(ns, rm) {
    await this._api("PUT", "meds_tracker/settings", {
      notify_service: ns,
      reminder_minutes: rm,
    });
    await this._fetch();
    this._renderContent();
    // Brief visual confirmation
    const btn = this.shadowRoot.getElementById("save-settings");
    if (btn) { btn.textContent = "✓ Saved"; setTimeout(() => { btn.textContent = "Save Settings"; }, 1800); }
  }

  async _resetAll() {
    if (!confirm("Delete ALL recipients, medications, and history? This cannot be undone.")) return;
    for (const r of (this._config?.recipients ?? [])) {
      await this._api("DELETE", `meds_tracker/recipients/${r.id}`);
    }
    await this._fetch(); this._renderContent();
  }

  // ── Utils ─────────────────────────────────────────────────

  _esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

customElements.define("meds-tracker-panel", MedsTrackerPanel);
