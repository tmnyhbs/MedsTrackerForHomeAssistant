"""Coordinator for Meds Tracker — manages scheduling, notifications, and state."""
from __future__ import annotations

import logging
from datetime import date

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_change

from .const import DOMAIN
from .store import MedsTrackerStore

_LOGGER = logging.getLogger(__name__)


class MedsTrackerCoordinator:
    """Central hub: owns the store, schedule callbacks, and entity updates."""

    def __init__(self, hass: HomeAssistant, store: MedsTrackerStore) -> None:
        self.hass = hass
        self.store = store
        self._entity_adder = None
        self._schedule_unsubs: list = []
        self._listeners: list = []

    # ------------------------------------------------------------------
    # Setup / teardown
    # ------------------------------------------------------------------

    async def async_setup(self) -> None:
        await self.store.async_load()
        self._rebuild_schedules()
        self.hass.bus.async_listen(
            "mobile_app_notification_action", self._handle_notification_action
        )

    def teardown(self) -> None:
        for unsub in self._schedule_unsubs:
            try:
                unsub()
            except Exception:  # noqa: BLE001
                pass
        self._schedule_unsubs.clear()

    # ------------------------------------------------------------------
    # Entity management
    # ------------------------------------------------------------------

    def set_entity_adder(self, adder) -> None:
        self._entity_adder = adder

    def add_listener(self, listener) -> None:
        self._listeners.append(listener)

    def remove_listener(self, listener) -> None:
        self._listeners.discard(listener) if hasattr(self._listeners, "discard") else None
        if listener in self._listeners:
            self._listeners.remove(listener)

    def _notify_listeners(self) -> None:
        for listener in list(self._listeners):
            try:
                listener()
            except Exception as exc:  # noqa: BLE001
                _LOGGER.error("Listener error: %s", exc)

    def _fire_update(self) -> None:
        self.hass.bus.async_fire(f"{DOMAIN}_update", {})

    # ------------------------------------------------------------------
    # Scheduling
    # ------------------------------------------------------------------

    def _is_due(self, schedule: dict, now) -> bool:
        """Return True if this schedule should fire/show today."""
        rec = schedule.get("recurrence") or {"type": "daily"}
        rtype = rec.get("type", "daily")
        today = now if isinstance(now, date) else now.date() if hasattr(now, "date") else date.today()
        if rtype == "daily":
            return True
        if rtype == "weekly":
            return today.weekday() in rec.get("days", [])
        if rtype == "interval":
            next_due = rec.get("next_due", "")
            if not next_due:
                return True
            return today.isoformat() >= next_due
        return True

    def _rebuild_schedules(self) -> None:
        for unsub in self._schedule_unsubs:
            try:
                unsub()
            except Exception:  # noqa: BLE001
                pass
        self._schedule_unsubs.clear()

        # Collect unique (hour, minute) combos across all meds
        schedule_times: set[tuple[int, int]] = set()
        for med in self.store.get_medications():
            for sch in med.get("schedules", []):
                try:
                    h, m = map(int, sch["time"].split(":"))
                    schedule_times.add((h, m))
                except (ValueError, KeyError):
                    continue

        for hour, minute in schedule_times:
            unsub = async_track_time_change(
                self.hass, self._handle_schedule_fire, hour=hour, minute=minute, second=0
            )
            self._schedule_unsubs.append(unsub)
            _LOGGER.debug("Registered schedule trigger at %02d:%02d", hour, minute)

        # Midnight cleanup
        unsub = async_track_time_change(
            self.hass, self._handle_midnight, hour=0, minute=0, second=0
        )
        self._schedule_unsubs.append(unsub)

    async def _handle_schedule_fire(self, now) -> None:
        current_time = now.strftime("%H:%M")
        global_service = self.store.get_settings().get("notify_service", "notify.notify")

        for med in self.store.get_medications():
            for sch in med.get("schedules", []):
                if sch.get("time") != current_time:
                    continue
                if not self._is_due(sch, now):
                    continue
                recipient = next(
                    (r for r in self.store.get_recipients() if r["id"] == med["recipient_id"]),
                    {"name": "Unknown"},
                )
                services = med.get("notify_services") or [global_service]
                for svc in services:
                    await self._send_notification(svc, med, sch, recipient)

        self._notify_listeners()
        self._fire_update()

    async def _send_notification(self, notify_service: str, med, schedule, recipient) -> None:
        action_id = f"MEDS_CONFIRM_{med['id']}_{schedule['id']}"
        label = schedule.get("label") or schedule["time"]
        message = f"{label}: {med['name']} for {recipient['name']}"
        panel_path = "/meds-tracker"
        try:
            parts = notify_service.split(".", 1)
            domain = parts[0]
            service = parts[1] if len(parts) > 1 else notify_service
            await self.hass.services.async_call(
                domain,
                service,
                {
                    "title": "Meds Reminder",
                    "message": message,
                    "data": {
                        # iOS: tap body opens panel; Android: clickAction
                        "url": panel_path,
                        "clickAction": panel_path,
                        "actions": [
                            {
                                "action": action_id,
                                "title": "Mark Given",
                                # iOS Companion App background action flags
                                "activationMode": "background",
                                "authenticationRequired": False,
                                "destructive": False,
                            },
                            {
                                "action": "URI",
                                "title": "Open Tracker",
                                "uri": panel_path,
                            },
                        ],
                        "tag": action_id,
                        "persistent": True,
                    },
                },
            )
        except Exception as exc:  # noqa: BLE001
            _LOGGER.error("Failed to send notification for %s: %s", med["name"], exc)

    async def _handle_notification_action(self, event) -> None:
        action = event.data.get("action", "")
        if not action.startswith("MEDS_CONFIRM_"):
            return
        # Format: MEDS_CONFIRM_{med_id}_{sch_id}
        remainder = action[len("MEDS_CONFIRM_"):]
        # med_id and sch_id are each 8 chars
        if len(remainder) < 17:
            return
        med_id = remainder[:8]
        sch_id = remainder[9:]
        device_name = event.data.get("device_id", "phone")
        self.store.confirm_dose(med_id, sch_id, confirmed_by=device_name)
        await self.store.async_save()
        self._notify_listeners()
        self._fire_update()

    async def _handle_midnight(self, _now) -> None:
        self.store.cleanup_old_logs()
        await self.store.async_save()
        self._notify_listeners()
        self._fire_update()

    # ------------------------------------------------------------------
    # Public mutation methods (called by HTTP views and services)
    # ------------------------------------------------------------------

    async def confirm_dose(
        self, medication_id: str, schedule_id: str, confirmed_by: str = ""
    ) -> dict:
        entry = self.store.confirm_dose(medication_id, schedule_id, confirmed_by)
        self.store.advance_interval_next_due(medication_id, schedule_id)
        await self.store.async_save()
        self._notify_listeners()
        self._fire_update()
        return entry

    async def update_dose_confirmed_by(
        self, medication_id: str, schedule_id: str, dose_date: str, confirmed_by: str
    ) -> dict | None:
        entry = self.store.update_dose_confirmed_by(
            medication_id, schedule_id, dose_date, confirmed_by
        )
        if entry:
            await self.store.async_save()
            self._notify_listeners()
            self._fire_update()
        return entry

    async def add_recipient(self, name: str, type_: str, icon: str) -> dict:
        r = self.store.add_recipient(name, type_, icon)
        await self.store.async_save()
        return r

    async def update_recipient(self, recipient_id: str, **kwargs) -> dict | None:
        r = self.store.update_recipient(recipient_id, **kwargs)
        await self.store.async_save()
        self._notify_listeners()
        return r

    async def delete_recipient(self, recipient_id: str) -> None:
        self.store.delete_recipient(recipient_id)
        await self.store.async_save()
        self._rebuild_schedules()
        self._notify_listeners()
        self._fire_update()

    async def add_medication(
        self, recipient_id: str, name: str, color: str, notes: str
    ) -> dict:
        med = self.store.add_medication(recipient_id, name, color, notes)
        await self.store.async_save()
        return med

    async def update_medication(self, med_id: str, **kwargs) -> dict | None:
        m = self.store.update_medication(med_id, **kwargs)
        await self.store.async_save()
        self._notify_listeners()
        return m

    async def delete_medication(self, med_id: str) -> None:
        self.store.delete_medication(med_id)
        await self.store.async_save()
        self._rebuild_schedules()
        self._notify_listeners()
        self._fire_update()

    async def add_schedule(
        self, med_id: str, time: str, label: str, recurrence: dict | None = None
    ) -> dict | None:
        sch, med = self.store.add_schedule(med_id, time, label, recurrence)
        if sch is None:
            return None
        await self.store.async_save()
        self._rebuild_schedules()
        # Dynamically add sensor entity for the new schedule
        if self._entity_adder and med:
            from .sensor import MedDoseSensor  # avoid circular import at module level
            self._entity_adder([MedDoseSensor(self, med, sch)])
        return sch

    async def delete_schedule(self, med_id: str, schedule_id: str) -> None:
        self.store.delete_schedule(med_id, schedule_id)
        await self.store.async_save()
        self._rebuild_schedules()

    async def update_settings(self, **kwargs) -> dict:
        s = self.store.update_settings(**kwargs)
        await self.store.async_save()
        return s

    # ------------------------------------------------------------------
    # Read helpers
    # ------------------------------------------------------------------

    def get_config(self) -> dict:
        today = date.today()
        medications = []
        for med in self.store.get_medications():
            med_copy = dict(med)
            schedules = []
            for sch in med.get("schedules", []):
                sch_copy = dict(sch)
                sch_copy["due_today"] = self._is_due(sch, today)
                schedules.append(sch_copy)
            med_copy["schedules"] = schedules
            medications.append(med_copy)
        return {
            "recipients": self.store.get_recipients(),
            "medications": medications,
            "settings": self.store.get_settings(),
        }

    def get_today_doses(self) -> list:
        return self.store.get_today_doses()
