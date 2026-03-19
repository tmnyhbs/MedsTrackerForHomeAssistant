"""Meds Tracker — Home Assistant custom integration."""
from __future__ import annotations

import logging
import os

from homeassistant.components.frontend import (
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.components.http import StaticPathConfig
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

    # --- FRONTEND REGISTRATION ---
    
    # 1. Physical folder mapping
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    
    # 2. Register folder as static path
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            "/meds_tracker_panel",
            frontend_dir,
            False,
        )
    ])

    # 3. Register Sidebar Panel
    # Note: We must use module_url and name inside the config dict
    # to stop the frontend from looking for 'html_url'.
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "name": "meds-tracker-panel",
            "module_url": "/meds_tracker_panel/meds-tracker-panel.js",
            "embed_iframe": False,
            "trust_external_script": True,
        },
        require_admin=False,
    )

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
        async_remove_panel(hass, PANEL_URL)
    except Exception:  # noqa: BLE001
        pass

    if unload_ok:
        hass.data.pop(DOMAIN, None)

    return unload_ok
