"""Meds Tracker — Home Assistant custom integration."""
from __future__ import annotations

import logging
import os
import shutil

from homeassistant.components.frontend import async_register_built_in_panel, async_remove_panel
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .coordinator import MedsTrackerCoordinator
from .http_views import ALL_VIEWS
from .services import async_setup_services, async_unregister_services
from .store import MedsTrackerStore

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["sensor"]

JS_PANEL     = "meds-tracker-panel.js"
JS_CARD      = "meds-tracker-card.js"
CARD_RES_URL = f"/local/{JS_CARD}"


def _copy_frontend(src_dir: str, www_dir: str) -> None:
    """Blocking file copies — must be called via executor."""
    os.makedirs(www_dir, exist_ok=True)
    for fname in (JS_PANEL, JS_CARD):
        src = os.path.join(src_dir, fname)
        dst = os.path.join(www_dir, fname)
        if os.path.isfile(src):
            shutil.copy2(src, dst)
        else:
            raise FileNotFoundError(f"Missing frontend file: {src}")


async def _async_register_card_resource(hass: HomeAssistant) -> None:
    """Add the card JS as a Lovelace resource if not already present."""
    try:
        lovelace = hass.data.get("lovelace")
        if lovelace is None:
            _LOGGER.debug("Meds Tracker: lovelace not ready, skipping resource registration")
            return

        resources: ResourceStorageCollection = lovelace.get("resources")
        if resources is None:
            _LOGGER.debug("Meds Tracker: lovelace resources not available")
            return

        # Ensure the collection is loaded
        await resources.async_load()

        # Check if already registered
        for item in resources.async_items():
            if item.get("url") == CARD_RES_URL:
                _LOGGER.debug("Meds Tracker: card resource already registered")
                return

        # Register it
        await resources.async_create_item({"res_type": "module", "url": CARD_RES_URL})
        _LOGGER.info("Meds Tracker: registered Lovelace resource %s", CARD_RES_URL)

    except Exception as exc:  # noqa: BLE001
        # Non-fatal — user can register manually
        _LOGGER.warning(
            "Meds Tracker: could not auto-register Lovelace resource (%s). "
            "Add it manually: Settings → Dashboards → Resources → %s (JavaScript module).",
            exc, CARD_RES_URL,
        )


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Meds Tracker from a config entry."""
    store = MedsTrackerStore(hass)
    coordinator = MedsTrackerCoordinator(hass, store)
    await coordinator.async_setup()

    hass.data[DOMAIN] = coordinator

    for view_cls in ALL_VIEWS:
        hass.http.register_view(view_cls)

    await async_setup_services(hass, coordinator)

    # ── Copy panel + card JS to config/www/ via executor ─────
    src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
    www_dir = hass.config.path("www")

    try:
        await hass.async_add_executor_job(_copy_frontend, src_dir, www_dir)
        _LOGGER.info("Meds Tracker: frontend JS copied to %s", www_dir)
    except Exception as exc:
        _LOGGER.error("Meds Tracker: failed to copy frontend JS — %s", exc)
        return False

    # ── Register Lovelace card resource ───────────────────────
    await _async_register_card_resource(hass)

    # ── Remove any stale panel before re-registering ──────────
    try:
        async_remove_panel(hass, PANEL_URL)
    except Exception:  # noqa: BLE001
        pass

    # ── Register sidebar panel ────────────────────────────────
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "meds-tracker-panel",
                "module_url": f"/local/{JS_PANEL}",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _LOGGER.info(
        "Meds Tracker ready — panel at /local/%s · card at /local/%s",
        JS_PANEL, JS_CARD,
    )
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
