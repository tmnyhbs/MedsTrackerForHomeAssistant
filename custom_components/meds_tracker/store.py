"""Persistent storage for Meds Tracker."""
from __future__ import annotations

import copy
import logging
import uuid
from datetime import date, datetime, timedelta, timezone

from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

EMPTY_DATA: dict = {
    "recipients": [],
    "medications": [],
    "dose_log": [],
    "settings": {
        "notify_service": "notify.notify",
        "reminder_minutes": 30,
    },
}


class MedsTrackerStore:
    """Wraps HA Store with domain-specific CRUD helpers."""

    def __init__(self, hass) -> None:
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict = {}

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def async_load(self) -> dict:
        data = await self._store.async_load()
        if data is None:
            self._data = copy.deepcopy(EMPTY_DATA)
        else:
            self._data = data
            for key, default in EMPTY_DATA.items():
                if key not in self._data:
                    self._data[key] = copy.deepcopy(default)
        return self._data

    async def async_save(self) -> None:
        await self._store.async_save(self._data)

    @property
    def data(self) -> dict:
        return self._data

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _new_id() -> str:
        return str(uuid.uuid4())[:8]

    # ------------------------------------------------------------------
    # Recipients
    # ------------------------------------------------------------------

    def get_recipients(self) -> list:
        return self._data.get("recipients", [])

    def add_recipient(self, name: str, type_: str, icon: str) -> dict:
        rec = {"id": self._new_id(), "name": name, "type": type_, "icon": icon}
        self._data["recipients"].append(rec)
        return rec

    def update_recipient(self, recipient_id: str, **kwargs) -> dict | None:
        for r in self._data["recipients"]:
            if r["id"] == recipient_id:
                for k, v in kwargs.items():
                    if k != "id":
                        r[k] = v
                return r
        return None

    def delete_recipient(self, recipient_id: str) -> None:
        med_ids = {
            m["id"]
            for m in self._data["medications"]
            if m["recipient_id"] == recipient_id
        }
        self._data["recipients"] = [
            r for r in self._data["recipients"] if r["id"] != recipient_id
        ]
        self._data["medications"] = [
            m for m in self._data["medications"] if m["recipient_id"] != recipient_id
        ]
        self._data["dose_log"] = [
            d for d in self._data["dose_log"] if d["medication_id"] not in med_ids
        ]

    # ------------------------------------------------------------------
    # Medications
    # ------------------------------------------------------------------

    def get_medications(self, recipient_id: str | None = None) -> list:
        meds = self._data.get("medications", [])
        if recipient_id:
            meds = [m for m in meds if m["recipient_id"] == recipient_id]
        return meds

    def get_medication(self, med_id: str) -> dict | None:
        return next((m for m in self._data["medications"] if m["id"] == med_id), None)

    def add_medication(
        self, recipient_id: str, name: str, color: str, notes: str
    ) -> dict:
        med = {
            "id": self._new_id(),
            "recipient_id": recipient_id,
            "name": name,
            "color": color or "#3498db",
            "notes": notes or "",
            "schedules": [],
            "notify_services": [],  # empty = use global setting
        }
        self._data["medications"].append(med)
        return med

    def update_medication(self, med_id: str, **kwargs) -> dict | None:
        for m in self._data["medications"]:
            if m["id"] == med_id:
                kwargs.pop("id", None)
                kwargs.pop("schedules", None)
                kwargs.pop("recipient_id", None)
                m.update(kwargs)
                return m
        return None

    def delete_medication(self, med_id: str) -> None:
        self._data["medications"] = [
            m for m in self._data["medications"] if m["id"] != med_id
        ]
        self._data["dose_log"] = [
            d for d in self._data["dose_log"] if d["medication_id"] != med_id
        ]

    # ------------------------------------------------------------------
    # Schedules
    # ------------------------------------------------------------------

    def add_schedule(
        self, med_id: str, time: str, label: str, recurrence: dict | None = None
    ) -> tuple[dict | None, dict | None]:
        med = self.get_medication(med_id)
        if not med:
            return None, None
        sch = {
            "id": self._new_id(),
            "time": time,
            "label": label or "",
            "recurrence": recurrence or {"type": "daily"},
        }
        # For interval schedules, initialise next_due to today
        if sch["recurrence"].get("type") == "interval":
            sch["recurrence"].setdefault("next_due", date.today().isoformat())
        med["schedules"].append(sch)
        return sch, med

    def delete_schedule(self, med_id: str, schedule_id: str) -> bool:
        med = self.get_medication(med_id)
        if not med:
            return False
        before = len(med["schedules"])
        med["schedules"] = [s for s in med["schedules"] if s["id"] != schedule_id]
        return len(med["schedules"]) < before

    def advance_interval_next_due(self, med_id: str, schedule_id: str) -> None:
        """Push next_due forward by interval_days after a dose is confirmed."""
        med = self.get_medication(med_id)
        if not med:
            return
        for sch in med.get("schedules", []):
            if sch["id"] != schedule_id:
                continue
            rec = sch.get("recurrence", {})
            if rec.get("type") != "interval":
                return
            interval = float(rec.get("interval_days", 1))
            next_dt = datetime.now(timezone.utc) + timedelta(days=interval)
            rec["next_due"] = next_dt.date().isoformat()
            return

    # ------------------------------------------------------------------
    # Dose log
    # ------------------------------------------------------------------

    def get_today_doses(self) -> list:
        today = date.today().isoformat()
        return [d for d in self._data["dose_log"] if d["date"] == today]

    def confirm_dose(
        self, medication_id: str, schedule_id: str, confirmed_by: str = ""
    ) -> dict:
        today = date.today().isoformat()
        now = datetime.now(timezone.utc).isoformat()
        for d in self._data["dose_log"]:
            if (
                d["medication_id"] == medication_id
                and d["schedule_id"] == schedule_id
                and d["date"] == today
            ):
                d["confirmed_at"] = now
                d["confirmed_by"] = confirmed_by
                return d
        entry = {
            "medication_id": medication_id,
            "schedule_id": schedule_id,
            "date": today,
            "confirmed_at": now,
            "confirmed_by": confirmed_by,
        }
        self._data["dose_log"].append(entry)
        return entry

    def update_dose_confirmed_by(
        self, medication_id: str, schedule_id: str, dose_date: str, confirmed_by: str
    ) -> dict | None:
        """Update the confirmed_by field on an existing dose log entry."""
        for d in self._data["dose_log"]:
            if (
                d["medication_id"] == medication_id
                and d["schedule_id"] == schedule_id
                and d["date"] == dose_date
            ):
                d["confirmed_by"] = confirmed_by
                return d
        return None

    def cleanup_old_logs(self, days: int = 90) -> None:
        cutoff = (date.today() - timedelta(days=days)).isoformat()
        self._data["dose_log"] = [
            d for d in self._data["dose_log"] if d.get("date", "") >= cutoff
        ]

    # ------------------------------------------------------------------
    # Settings
    # ------------------------------------------------------------------

    def get_settings(self) -> dict:
        return self._data.get("settings", copy.deepcopy(EMPTY_DATA["settings"]))

    def update_settings(self, **kwargs) -> dict:
        self._data["settings"].update(kwargs)
        return self._data["settings"]
