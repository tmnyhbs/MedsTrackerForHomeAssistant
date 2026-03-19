"""Sensor platform for Meds Tracker — one entity per medication schedule."""
from __future__ import annotations

import logging
import re
from datetime import date, datetime

from homeassistant.components.sensor import SensorEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "_", text.lower()).strip("_")


async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = hass.data[DOMAIN]
    coordinator.set_entity_adder(async_add_entities)

    entities = [
        MedDoseSensor(coordinator, med, sch)
        for med in coordinator.store.get_medications()
        for sch in med.get("schedules", [])
    ]
    if entities:
        async_add_entities(entities, update_before_add=True)


class MedDoseSensor(SensorEntity):
    """Represents one scheduled dose — state is pending / confirmed / missed."""

    def __init__(self, coordinator, medication: dict, schedule: dict) -> None:
        self._coordinator = coordinator
        self._medication = medication
        self._schedule = schedule

        med_id = medication["id"]
        sch_id = schedule["id"]
        self._attr_unique_id = f"{DOMAIN}_{med_id}_{sch_id}"
        self._attr_name = (
            f"Meds {medication['name']} {schedule.get('label') or schedule['time']}"
        )

    # ------------------------------------------------------------------
    # State
    # ------------------------------------------------------------------

    @property
    def state(self) -> str:
        today = date.today().isoformat()
        for d in self._coordinator.store.get_today_doses():
            if (
                d["medication_id"] == self._medication["id"]
                and d["schedule_id"] == self._schedule["id"]
            ):
                return "confirmed"

        now = datetime.now()
        try:
            h, m = map(int, self._schedule["time"].split(":"))
            if now.hour > h or (now.hour == h and now.minute >= m + 1):
                return "missed"
        except (ValueError, KeyError):
            pass
        return "pending"

    @property
    def extra_state_attributes(self) -> dict:
        doses = self._coordinator.store.get_today_doses()
        dose = next(
            (
                d
                for d in doses
                if d["medication_id"] == self._medication["id"]
                and d["schedule_id"] == self._schedule["id"]
            ),
            None,
        )
        recipient = next(
            (
                r
                for r in self._coordinator.store.get_recipients()
                if r["id"] == self._medication.get("recipient_id")
            ),
            None,
        )
        return {
            "medication_id": self._medication["id"],
            "medication_name": self._medication.get("name"),
            "schedule_id": self._schedule["id"],
            "schedule_time": self._schedule.get("time"),
            "schedule_label": self._schedule.get("label"),
            "recipient_name": recipient["name"] if recipient else None,
            "color": self._medication.get("color"),
            "notes": self._medication.get("notes", ""),
            "confirmed_at": dose["confirmed_at"] if dose else None,
            "confirmed_by": dose["confirmed_by"] if dose else None,
        }

    @property
    def icon(self) -> str:
        state = self.state
        if state == "confirmed":
            return "mdi:check-circle"
        if state == "missed":
            return "mdi:alert-circle"
        return "mdi:pill"

    # ------------------------------------------------------------------
    # HA lifecycle
    # ------------------------------------------------------------------

    async def async_added_to_hass(self) -> None:
        self._coordinator.add_listener(self.async_write_ha_state)

    async def async_will_remove_from_hass(self) -> None:
        self._coordinator.remove_listener(self.async_write_ha_state)

    async def async_update(self) -> None:
        pass  # State derives from store; coordinator notifies us on change
