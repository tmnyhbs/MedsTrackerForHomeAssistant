"""Meds Tracker — Home Assistant custom integration."""
from __future__ import annotations

import logging
import os
import shutil

from homeassistant.components.frontend import async_register_built_in_panel, async_remove_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .coordinator import MedsTrackerCoordinator
from .http_views import ALL_VIEWS
from .services import async_setup_services, async_unregister_services
from .store import MedsTrackerStore

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["sensor"]

JS_FILENAME = "meds-tracker-panel.js"


def _copy_panel_js(src: str, dst: str) -> None:
    """Blocking file copy — must be called via executor."""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Meds Tracker from a config entry."""
    store = MedsTrackerStore(hass)
    coordinator = MedsTrackerCoordinator(hass, store)
    await coordinator.async_setup()

    hass.data[DOMAIN] = coordinator

    for view_cls in ALL_VIEWS:
        hass.http.register_view(view_cls)

    await async_setup_services(hass, coordinator)

    # ── Copy panel JS into config/www/ via executor (non-blocking) ───
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", JS_FILENAME)
    dst = hass.config.path("www", JS_FILENAME)

    try:
        await hass.async_add_executor_job(_copy_panel_js, src, dst)
        _LOGGER.info("Meds Tracker: panel JS copied to %s", dst)
    except Exception as exc:
        _LOGGER.error(
            "Meds Tracker: failed to copy panel JS to www/ — %s. "
            "Manually copy frontend/%s to config/www/ and restart.",
            exc, JS_FILENAME,
        )
        return False

    # ── Remove any stale panel registration before re-registering ────
    try:
        async_remove_panel(hass, PANEL_URL)
        _LOGGER.debug("Meds Tracker: removed stale panel registration for %s", PANEL_URL)
    except Exception:  # noqa: BLE001
        pass  # Not registered yet — that's fine

    # ── Register sidebar panel at /local/ ────────────────────────────
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "meds-tracker-panel",
                "module_url": f"/local/{JS_FILENAME}",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _LOGGER.info("Meds Tracker ready — panel at /local/%s", JS_FILENAME)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    coordinator: MedsTrackerCoordinator = hass.data.get(DOMAIN)
    if coordinator:
        coordinator.teardown()

    await async_unregister_services(hass)
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    try:
        async_remove_panel(hass, PANEL_URL)
    except Exception:  # noqa: BLE001
        pass

    if unload_ok:
        hass.data.pop(DOMAIN, None)

    return unload_ok
