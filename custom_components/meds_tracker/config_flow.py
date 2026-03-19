"""Config flow for Meds Tracker — single instance only."""
from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries

from .const import CONF_NOTIFY_SERVICE, DEFAULT_NOTIFY_SERVICE, DOMAIN


class MedsTrackerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(title="Meds Tracker", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_NOTIFY_SERVICE, default=DEFAULT_NOTIFY_SERVICE
                    ): str,
                }
            ),
        )
