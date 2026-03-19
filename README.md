# Meds Tracker — Home Assistant Integration

Track medications for multiple recipients (pets or people) with scheduled reminders, mobile push notifications, and a built-in management panel in the HA sidebar.

---

## Features

- **Multiple recipients** — pets, people, or any mix
- **Multiple medications per recipient** — name, colour, dosage notes
- **Multiple schedule times per medication** — e.g. 08:00 AM + 8:00 PM
- **Mobile push notifications** with a one-tap "Mark Given" action button
- **Sidebar panel** — full-featured web UI for managing everything
- **Sensor entities** — one `sensor.meds_*` entity per dose slot (pending / confirmed / missed) for use in dashboards and automations
- **HA service** — `meds_tracker.confirm_dose` callable from automations, scripts, or voice assistants
- **Persistent storage** — survives HA restarts; stored in `.storage/meds_tracker_data`

---

## Installation via HACS

1. Open **HACS → Integrations → ⋮ → Custom repositories**
2. Add `[https://github.com/tmnyhbs/MedsTrackerForHomeAssistant]` as type **Integration**
3. Search for "Meds Tracker" and install
4. Restart Home Assistant
5. Go to **Settings → Devices & Services → + Add Integration** → search **Meds Tracker**
6. Enter your notify service (e.g. `notify.mobile_app_everyone`) and confirm

---

## Manual Installation

1. Copy the `custom_components/meds_tracker/` folder into your HA `config/custom_components/` directory
2. Restart Home Assistant
3. Add the integration via **Settings → Devices & Services → + Add Integration → Meds Tracker**

---

## Using the Panel

After setup, a **💊 Meds Tracker** entry appears in the HA sidebar.

| Tab | What you can do |
|---|---|
| **Dashboard** | See today's dose status at a glance; tap "Mark Given" to confirm |
| **Recipients** | Add / edit / delete pets or people |
| **Medications** | Add meds per recipient with colour coding and dosage notes |
| **Medications** | Add or remove schedule times inline per medication |
| **Settings** | Change notify service and reminder delay |

---

## Notification Setup

Meds Tracker sends reminders via any HA `notify.*` service. To notify all household phones:

```yaml
# configuration.yaml
notify:
  - platform: group
    name: mobile_app_everyone
    services:
      - service: mobile_app_your_phone
      - service: mobile_app_partner_phone
```

Then set **Notify Service** to `notify.mobile_app_everyone` in the Settings tab.

Tapping the **"✅ Mark Given"** action button on the phone notification automatically confirms the dose.

---

## Sensor Entities

For each medication + schedule combination, a sensor entity is created:

- **State:** `pending` / `confirmed` / `missed`
- **Attributes:** `medication_name`, `recipient_name`, `schedule_time`, `confirmed_at`, `confirmed_by`, `notes`, `color`

Example sensor ID: `sensor.meds_abc12345_def67890`

Use these in Lovelace cards, automations, or voice assistants.

---

## HA Service

```yaml
service: meds_tracker.confirm_dose
data:
  medication_id: "abc12345"
  schedule_id:   "def67890"
  confirmed_by:  "Alice"
```

Find `medication_id` and `schedule_id` in the sensor entity attributes or from `GET /api/meds_tracker/config`.

---

## REST API

All endpoints require HA authentication (Bearer token or cookie).

| Method | Path | Description |
|---|---|---|
| GET | `/api/meds_tracker/config` | Full config (recipients, meds, settings) |
| GET | `/api/meds_tracker/doses/today` | Today's confirmed doses |
| POST | `/api/meds_tracker/doses/confirm` | Confirm a dose `{medication_id, schedule_id, confirmed_by}` |
| POST | `/api/meds_tracker/recipients` | Add recipient `{name, type, icon}` |
| PUT | `/api/meds_tracker/recipients/{id}` | Update recipient |
| DELETE | `/api/meds_tracker/recipients/{id}` | Delete recipient + their meds |
| POST | `/api/meds_tracker/medications` | Add medication `{recipient_id, name, color, notes}` |
| PUT | `/api/meds_tracker/medications/{id}` | Update medication |
| DELETE | `/api/meds_tracker/medications/{id}` | Delete medication |
| POST | `/api/meds_tracker/medications/{id}/schedules` | Add schedule `{time, label}` |
| DELETE | `/api/meds_tracker/medications/{id}/schedules/{sch_id}` | Remove schedule |
| PUT | `/api/meds_tracker/settings` | Update settings `{notify_service, reminder_minutes}` |

---

## Troubleshooting

**Panel doesn't appear** — Restart HA, then hard-refresh the browser (Ctrl+Shift+R).

**Notifications not arriving** — Check your `notify_service` in the Settings tab. Ensure the service name matches exactly (e.g. `notify.mobile_app_my_iphone`).

**"Mark Given" tap on notification doesn't confirm** — Ensure the Companion App is configured to send `mobile_app_notification_action` events. This works by default on modern iOS/Android Companion apps.

**Sensors not updating** — Open Developer Tools → States and search for `sensor.meds_`. If states are stale, reload the integration from Settings → Devices & Services.

---

## License

MIT
