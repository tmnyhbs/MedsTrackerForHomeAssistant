"""REST API views — called by the Meds Tracker frontend panel."""
from __future__ import annotations

import logging

from homeassistant.components.http import HomeAssistantView

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def _coord(request):
    return request.app["hass"].data[DOMAIN]


# ------------------------------------------------------------------
# Config (read-only aggregate)
# ------------------------------------------------------------------

class MedsConfigView(HomeAssistantView):
    url = "/api/meds_tracker/config"
    name = "api:meds_tracker:config"
    requires_auth = True

    async def get(self, request):
        return self.json(_coord(request).get_config())


# ------------------------------------------------------------------
# Today's doses
# ------------------------------------------------------------------

class MedsTodayView(HomeAssistantView):
    url = "/api/meds_tracker/doses/today"
    name = "api:meds_tracker:doses:today"
    requires_auth = True

    async def get(self, request):
        return self.json(_coord(request).get_today_doses())


# ------------------------------------------------------------------
# Confirm dose
# ------------------------------------------------------------------

class MedsConfirmView(HomeAssistantView):
    url = "/api/meds_tracker/doses/confirm"
    name = "api:meds_tracker:doses:confirm"
    requires_auth = True

    async def post(self, request):
        data = await request.json()
        entry = await _coord(request).confirm_dose(
            data.get("medication_id", ""),
            data.get("schedule_id", ""),
            data.get("confirmed_by", ""),
        )
        return self.json(entry)


# ------------------------------------------------------------------
# Recipients
# ------------------------------------------------------------------

class MedsRecipientsView(HomeAssistantView):
    url = "/api/meds_tracker/recipients"
    name = "api:meds_tracker:recipients"
    requires_auth = True

    async def post(self, request):
        data = await request.json()
        r = await _coord(request).add_recipient(
            data.get("name", ""),
            data.get("type", "pet"),
            data.get("icon", "mdi:paw"),
        )
        return self.json(r)


class MedsRecipientView(HomeAssistantView):
    url = "/api/meds_tracker/recipients/{recipient_id}"
    name = "api:meds_tracker:recipient"
    requires_auth = True

    async def put(self, request, recipient_id):
        data = await request.json()
        r = await _coord(request).update_recipient(recipient_id, **data)
        return self.json(r or {"error": "not_found"})

    async def delete(self, request, recipient_id):
        await _coord(request).delete_recipient(recipient_id)
        return self.json({"ok": True})


# ------------------------------------------------------------------
# Medications
# ------------------------------------------------------------------

class MedsMedicationsView(HomeAssistantView):
    url = "/api/meds_tracker/medications"
    name = "api:meds_tracker:medications"
    requires_auth = True

    async def post(self, request):
        data = await request.json()
        m = await _coord(request).add_medication(
            data.get("recipient_id", ""),
            data.get("name", ""),
            data.get("color", "#3498db"),
            data.get("notes", ""),
        )
        return self.json(m)


class MedsMedicationView(HomeAssistantView):
    url = "/api/meds_tracker/medications/{med_id}"
    name = "api:meds_tracker:medication"
    requires_auth = True

    async def put(self, request, med_id):
        data = await request.json()
        m = await _coord(request).update_medication(med_id, **data)
        return self.json(m or {"error": "not_found"})

    async def delete(self, request, med_id):
        await _coord(request).delete_medication(med_id)
        return self.json({"ok": True})


# ------------------------------------------------------------------
# Schedules
# ------------------------------------------------------------------

class MedsSchedulesView(HomeAssistantView):
    url = "/api/meds_tracker/medications/{med_id}/schedules"
    name = "api:meds_tracker:schedules"
    requires_auth = True

    async def post(self, request, med_id):
        data = await request.json()
        sch = await _coord(request).add_schedule(
            med_id,
            data.get("time", "08:00"),
            data.get("label", ""),
        )
        return self.json(sch or {"error": "medication_not_found"})


class MedsScheduleView(HomeAssistantView):
    url = "/api/meds_tracker/medications/{med_id}/schedules/{schedule_id}"
    name = "api:meds_tracker:schedule"
    requires_auth = True

    async def delete(self, request, med_id, schedule_id):
        await _coord(request).delete_schedule(med_id, schedule_id)
        return self.json({"ok": True})


# ------------------------------------------------------------------
# Settings
# ------------------------------------------------------------------

class MedsSettingsView(HomeAssistantView):
    url = "/api/meds_tracker/settings"
    name = "api:meds_tracker:settings"
    requires_auth = True

    async def put(self, request):
        data = await request.json()
        s = await _coord(request).update_settings(**data)
        return self.json(s)


ALL_VIEWS = [
    MedsConfigView,
    MedsTodayView,
    MedsConfirmView,
    MedsRecipientsView,
    MedsRecipientView,
    MedsMedicationsView,
    MedsMedicationView,
    MedsSchedulesView,
    MedsScheduleView,
    MedsSettingsView,
]
