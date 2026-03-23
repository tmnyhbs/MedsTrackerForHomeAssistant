/**
 * Meds Tracker — Lovelace Custom Card
 * Add to a dashboard with type: custom:meds-tracker-card
 *
 * Optional config:
 *   recipient_id: "abc123"   — filter to one recipient
 *   title: "Bun's Meds"     — custom card title
 *   show_notes: true         — show dosage notes (default true)
 */

class MedsTrackerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._data = null;
    this._doses = [];
    this._loading = true;
  }

  static getStubConfig() {
    return { title: "Meds Tracker" };
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    const firstLoad = !this._hass;
    this._hass = hass;
    if (firstLoad) this._boot();
  }

  async _boot() {
    await this._fetch();
    this._loading = false;
    this._render();
    // Re-render when HA state changes (catch meds_tracker_update events via state polling)
    this._hass.connection
      .subscribeEvents(async () => { await this._fetch(); this._render(); }, "meds_tracker_update")
      .catch(() => {});
  }

  async _fetch() {
    try {
      const [cfg, doses] = await Promise.all([
        this._hass.callApi("GET", "meds_tracker/config"),
        this._hass.callApi("GET", "meds_tracker/doses/today"),
      ]);
      this._data = cfg;
      this._doses = doses || [];
    } catch (e) {
      this._data = null;
    }
  }

  _doseStatus(medId, schId, time) {
    if (this._doses.find(d => d.medication_id === medId && d.schedule_id === schId)) return "confirmed";
    const now = new Date();
    try {
      const [h, m] = time.split(":").map(Number);
      if (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m + 1)) return "missed";
    } catch (_) {}
    return "pending";
  }

  async _confirm(medId, schId) {
    await this._hass.callApi("POST", "meds_tracker/doses/confirm", {
      medication_id: medId,
      schedule_id: schId,
      confirmed_by: this._hass?.user?.name ?? "",
    });
    await this._fetch();
    this._render();
  }

  _esc(s) { return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  _render() {
    const cfg = this._config;
    const meds = this._data?.medications ?? [];
    const recs = this._data?.recipients ?? [];
    const showNotes = cfg.show_notes !== false;

    let items = [];
    for (const med of meds) {
      if (cfg.recipient_id && med.recipient_id !== cfg.recipient_id) continue;
      const rec = recs.find(r => r.id === med.recipient_id);
      for (const sch of (med.schedules ?? [])) {
        if (sch.due_today === false) continue;
        const status = this._doseStatus(med.id, sch.id, sch.time);
        const dose = this._doses.find(d => d.medication_id === med.id && d.schedule_id === sch.id);
        items.push({ med, sch, rec, status, dose });
      }
    }
    const order = { pending: 0, missed: 1, confirmed: 2 };
    items.sort((a, b) => order[a.status] - order[b.status]);

    const confirmed = items.filter(i => i.status === "confirmed").length;
    const total = items.length;
    const title = cfg.title || "Meds Tracker";

    const statusDot = {
      confirmed: `style="color:var(--success-color,#43a047)"`,
      pending:   `style="color:#fb8c00"`,
      missed:    `style="color:var(--error-color,#e53935)"`,
    };

    const rows = items.map(({ med, sch, rec, status, dose }) => {
      const confirmBtn = status !== "confirmed"
        ? `<button class="confirm-btn" data-med="${med.id}" data-sch="${sch.id}">Mark given</button>` : "";
      const meta = dose
        ? `<div class="row-meta">Given ${new Date(dose.confirmed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${dose.confirmed_by ? ` · ${this._esc(dose.confirmed_by)}` : ""}</div>` : "";
      const notes = showNotes && med.notes
        ? `<span class="row-notes">${this._esc(med.notes)}</span>` : "";
      return `
        <div class="dose-row ${status}" style="border-left-color:${med.color || "var(--primary-color)"}">
          <div class="row-info">
            <div class="row-name">${this._esc(med.name)}${rec ? `<span class="row-recip"> · ${this._esc(rec.name)}</span>` : ""}</div>
            <div class="row-sub"><span ${statusDot[status]}>●</span> ${this._esc(sch.label || sch.time)}${notes ? " · " : ""}${notes}</div>
            ${meta}
          </div>
          ${confirmBtn}
        </div>`;
    }).join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { padding: 0; overflow: hidden; }
        .header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--divider-color);
        }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .card-title { font-size: 1rem; font-weight: 500; }
        .progress {
          font-size: 0.78rem; color: var(--secondary-text-color);
          background: var(--secondary-background-color);
          padding: 2px 10px; border-radius: 12px;
        }
        .dose-list { display: flex; flex-direction: column; }
        .dose-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          border-left: 4px solid var(--divider-color);
          border-bottom: 1px solid var(--divider-color);
          transition: background .15s;
        }
        .dose-row:last-child { border-bottom: none; }
        .dose-row.confirmed { background: rgba(67,160,71,.04); }
        .dose-row.missed    { background: rgba(229,57,53,.04); }
        .row-info { flex: 1; min-width: 0; }
        .row-name {
          font-weight: 500; font-size: 0.9rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .row-recip { font-weight: 400; color: var(--secondary-text-color); }
        .row-sub { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 2px; }
        .row-notes { font-style: italic; }
        .row-meta { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 2px; }
        .confirm-btn {
          flex-shrink: 0;
          padding: 6px 12px; border-radius: 4px; border: none;
          background: transparent;
          color: var(--primary-color);
          font-size: 0.8rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
          cursor: pointer; font-family: inherit;
          transition: background .15s;
        }
        .confirm-btn:hover { background: rgba(var(--rgb-primary-color,3,169,244),.08); }
        .empty {
          padding: 24px 16px; text-align: center;
          font-size: 0.875rem; color: var(--secondary-text-color);
        }
        .loading { padding: 24px; text-align: center; color: var(--secondary-text-color); font-size: 0.875rem; }
      </style>
      <ha-card>
        <div class="header">
          <div class="header-left">
            <span class="card-title">${this._esc(title)}</span>
          </div>
          ${total > 0 ? `<span class="progress">${confirmed}/${total} given</span>` : ""}
        </div>
        ${this._loading
          ? `<div class="loading">Loading…</div>`
          : !items.length
            ? `<div class="empty">No medications scheduled for today.</div>`
            : `<div class="dose-list">${rows}</div>`}
      </ha-card>`;

    // Wire confirm buttons
    this.shadowRoot.querySelectorAll(".confirm-btn").forEach(btn =>
      btn.addEventListener("click", () => this._confirm(btn.dataset.med, btn.dataset.sch))
    );
  }
}

customElements.define("meds-tracker-card", MedsTrackerCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "meds-tracker-card",
  name: "Meds Tracker Card",
  description: "Shows today's medication schedule with one-tap confirm buttons.",
  preview: false,
});
