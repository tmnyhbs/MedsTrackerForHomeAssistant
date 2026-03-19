"""Home Assistant services for Meds Tracker."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN

SERVICE_CONFIRM_DOSE = "confirm_dose"

_CONFIRM_SCHEMA = vol.Schema(
    {
        vol.Required("medication_id"): cv.string,
        vol.Required("schedule_id"): cv.string,
        vol.Optional("confirmed_by", default=""): cv.string,
    }
)


async def async_setup_services(hass, coordinator) -> None:
    async def _handle_confirm(call):
        await coordinator.confirm_dose(
            call.data["medication_id"],
            call.data["schedule_id"],
            call.data.get("confirmed_by", ""),
        )

    hass.services.async_register(
        DOMAIN, SERVICE_CONFIRM_DOSE, _handle_confirm, schema=_CONFIRM_SCHEMA
    )


async def async_unregister_services(hass) -> None:
    hass.services.async_remove(DOMAIN, SERVICE_CONFIRM_DOSE)
