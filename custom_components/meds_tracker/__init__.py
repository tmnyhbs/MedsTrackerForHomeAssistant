"""Meds Tracker — Home Assistant custom integration."""
from __future__ import annotations

import logging
import os

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .coordinator import MedsTrackerCoordinator
from .http_views import ALL_VIEWS
from .services import async_setup_services, async_unregister_services
from .store import MedsTrackerStore

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["sensor"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Meds Tracker from a config entry."""
    store = MedsTrackerStore(hass)
    coordinator = MedsTrackerCoordinator(hass, store)
    await coordinator.async_setup()

    hass.data[DOMAIN] = coordinator

    # Register REST API views
    for view_cls in ALL_VIEWS:
        hass.http.register_view(view_cls)

    # Register HA services
    await async_setup_services(hass, coordinator)

    # Serve the frontend panel JS as a static file
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    panel_js = os.path.join(frontend_dir, "meds-tracker-panel.js")
    hass.http.register_static_path(
        "/meds_tracker_panel/meds-tracker-panel.js",
        panel_js,
        cache_headers=False,
    )

    # Register the sidebar panel
    hass.components.frontend.async_register_built_in_panel(
        "custom",
        PANEL_TITLE,
        PANEL_ICON,
        PANEL_URL,
        {
            "_panel_custom": {
                "name": "meds-tracker-panel",
                "module_url": "/meds_tracker_panel/meds-tracker-panel.js",
            }
        },
        require_admin=False,
    )

    # Set up sensor platform
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _LOGGER.info("Meds Tracker integration loaded successfully")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    coordinator: MedsTrackerCoordinator = hass.data.get(DOMAIN)
    if coordinator:
        coordinator.teardown()

    await async_unregister_services(hass)

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    try:
        hass.components.frontend.async_remove_panel(PANEL_URL)
    except Exception:  # noqa: BLE001
        pass

    if unload_ok:
        hass.data.pop(DOMAIN, None)

    return unload_ok
