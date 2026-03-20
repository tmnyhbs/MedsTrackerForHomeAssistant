# Meds Tracker

A Home Assistant custom integration for tracking medications across multiple recipients. Supports mobile push notifications, a built-in sidebar management panel, and a Lovelace dashboard card.

---

## Requirements

- Home Assistant 2023.1 or later
- Home Assistant Companion App on iOS or Android for mobile notifications
- HACS for managed installation (optional)

---

## Installation

### Via HACS

1. Open HACS and go to Integrations
2. Select the three-dot menu and choose Custom repositories
3. Add `https://github.com/tmnyhbs/MedsTrackerForHomeAssistant` as type Integration
4. Search for Meds Tracker and install
5. Restart Home Assistant
6. Go to Settings → Devices & Services → Add Integration and search for Meds Tracker
7. Enter a default notify service (for example `notify.notify`) and confirm

### Manual

1. Copy the `custom_components/meds_tracker/` folder into your `config/custom_components/` directory
2. Restart Home Assistant
3. Go to Settings → Devices & Services → Add Integration → Meds Tracker

On startup, the integration copies its frontend files into `config/www/` automatically. No manual file placement is required.

---

## Sidebar Panel

After setup, a Meds Tracker entry appears in the HA sidebar with four tabs.

**Dashboard**
Shows all scheduled doses for today grouped by status: given, pending, and missed. Each dose can be confirmed directly from this view with a single tap. Doses are sorted so items requiring action appear first.

**Recipients**
Add, edit, or delete the people and pets whose medications are being tracked. Each recipient has a name and a type (person or pet).

**Medications**
Add, edit, or delete medications assigned to a recipient. Each medication has a name, optional dosage notes, and a colour for visual identification.

Within each medication block you can manage two things inline without leaving the tab:

- Schedule times: add or remove dose times using a 12-hour picker with AM/PM selection. Existing times can be edited via the pencil icon on each time chip.
- Notification services: assign one or more `notify.*` services to a medication. These are drawn from the services available in your HA instance. If no services are assigned, the medication falls back to the global default set in Settings.

**Settings**
Set the global fallback notification service and the reminder delay in minutes. The reminder fires if a dose has not been confirmed within that window after the scheduled time. A reset option is available to delete all data.

---

## Lovelace Dashboard Card

A custom card is included for embedding a medication status view into any Lovelace dashboard.

To register the resource, go to Settings → Dashboards → Resources → Add resource and enter:

- URL: `/local/meds-tracker-card.js`
- Type: JavaScript module

Then add the card to any dashboard:

```yaml
type: custom:meds-tracker-card
```

Optional configuration:

```yaml
type: custom:meds-tracker-card
title: Bun's Medications
recipient_id: abc12345
show_notes: true
```

`recipient_id` filters the card to a single recipient. Find the ID from Settings → Devices & Services → Meds Tracker, or from `GET /api/meds_tracker/config`. `show_notes` defaults to true and controls whether dosage notes are shown beneath each medication name.

---

## Notifications

Meds Tracker sends reminders via any `notify.*` service registered in Home Assistant. Notifications include a Mark Given action button. Tapping it on a phone running the Companion App confirms the dose automatically without opening the app.

Notification services can be assigned globally (Settings tab) or on a per-medication basis (Medications tab). Per-medication assignments override the global setting. A medication with no assignments uses the global default.

To notify multiple people with a single service, create a notification group in `configuration.yaml`:

```yaml
notify:
  - platform: group
    name: household
    services:
      - service: mobile_app_phone_one
      - service: mobile_app_phone_two
```

This group then appears as `notify.household` in the Medications tab dropdown.

---

## Sensor Entities

One sensor entity is created for each medication and schedule time combination. These can be used in Lovelace cards, automations, and scripts.

State values: `pending`, `confirmed`, `missed`

Attributes: `medication_name`, `recipient_name`, `schedule_time`, `schedule_label`, `confirmed_at`, `confirmed_by`, `notes`, `color`

---

## HA Service

Doses can be confirmed programmatically from automations, scripts, or voice assistants:

```yaml
service: meds_tracker.confirm_dose
data:
  medication_id: "abc12345"
  schedule_id: "def67890"
  confirmed_by: "Alice"
```

`medication_id` and `schedule_id` are available in sensor entity attributes or via `GET /api/meds_tracker/config`.

---

## REST API

All endpoints require Home Assistant authentication.

| Method | Path | Body / Notes |
|--------|------|--------------|
| GET | `/api/meds_tracker/config` | Returns all recipients, medications, and settings |
| GET | `/api/meds_tracker/doses/today` | Returns today's confirmed dose log |
| POST | `/api/meds_tracker/doses/confirm` | `{medication_id, schedule_id, confirmed_by}` |
| POST | `/api/meds_tracker/recipients` | `{name, type, icon}` |
| PUT | `/api/meds_tracker/recipients/{id}` | `{name, type}` |
| DELETE | `/api/meds_tracker/recipients/{id}` | Also deletes all medications for that recipient |
| POST | `/api/meds_tracker/medications` | `{recipient_id, name, color, notes}` |
| PUT | `/api/meds_tracker/medications/{id}` | `{name, color, notes, notify_services}` |
| DELETE | `/api/meds_tracker/medications/{id}` | |
| POST | `/api/meds_tracker/medications/{id}/schedules` | `{time, label}` — time in 24-hour format HH:MM |
| DELETE | `/api/meds_tracker/medications/{id}/schedules/{schedule_id}` | |
| PUT | `/api/meds_tracker/settings` | `{notify_service, reminder_minutes}` |

---

## Troubleshooting

**Panel does not appear after installation**
Restart Home Assistant, then hard-refresh the browser with Ctrl+Shift+R. The panel JS is copied to `config/www/` on startup — confirm the file exists there if the panel still fails to load.

**Panel loads but is blank**
Open the browser console and check for a 404 on `/local/meds-tracker-panel.js`. If the file is missing from `config/www/`, reload the integration from Settings → Devices & Services.

**Notifications are not arriving**
Confirm the service name in the Settings tab or on the medication itself matches a service listed under Developer Tools → Services. Service names are case-sensitive.

**Mark Given tap on a notification does nothing**
The Companion App must be able to send `mobile_app_notification_action` events back to HA. Ensure the app has notification permissions and that the HA URL is reachable from the device.

**Sensors are stale**
Open Developer Tools → States and search for `sensor.meds_`. If states are not updating, reload the integration from Settings → Devices & Services.

**Integration fails to load after update**
Check the HA log (Settings → System → Logs) for the specific error. The most common cause after an update is a stale panel registration — deleting the integration entry and re-adding it resolves this.

---

## Data Storage

All configuration and dose history is stored in `.storage/meds_tracker_data` within the HA config directory. This file persists across restarts and updates. Dose history older than 90 days is pruned automatically at midnight.

---

## License

MIT
