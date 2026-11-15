"""Hyggespil – selskabsspil til Home Assistant.

Udvikler: Allan Persson · Licens: MIT

Integrationen serverer spillets filer direkte fra sin egen mappe (www/) og viser spillet i et
panel i sidebjælken. Den skriver ingenting i Home Assistants konfiguration og rører ikke
config/www. Spillernavne, aldre, point og grupper gemmes kun i browseren på den enhed, der spilles på.

Spillet kan fortælle Home Assistant, hvad der sker (tjenesten ``hyggespil.status``), så lys og
andre automatiseringer kan bygges på det – se docs/spaending.md.
"""
from __future__ import annotations

import json
import logging
import random
from datetime import UTC, datetime
from pathlib import Path

from homeassistant.components.frontend import (
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL, URL_BASE

_LOGGER = logging.getLogger(__name__)

WWW_DIR = Path(__file__).parent / "www"
_STATIC_REGISTERED = f"{DOMAIN}_static_registered"
_SERVICE_REGISTERED = f"{DOMAIN}_service_registered"
_PLATFORMS = ["sensor"]
FELTER = ("spil", "spil_navn", "spillere", "sekunder", "tid", "urgency", "puls", "musik")


def _version() -> str:
    """Returnér den installerede version, så den kan ses i loggen."""
    try:
        return str(json.loads((Path(__file__).parent / "manifest.json").read_text(encoding="utf-8"))["version"])
    except (OSError, ValueError, KeyError):
        return "ukendt"


VERSION = _version()


async def _async_status(hass: HomeAssistant, call: ServiceCall) -> None:
    """Modtag spillets tilstand: gem på sensoren og send en hændelse."""
    data: dict = {"state": str(call.data.get("state") or "klar")}
    for felt in FELTER:
        if felt in call.data and call.data[felt] is not None:
            data[felt] = call.data[felt]
    data["opdateret"] = datetime.now(UTC).isoformat()

    sensor = hass.data.get(DOMAIN, {}).get("sensor")
    if sensor is not None:
        sensor.ny_status(data)

    hass.bus.async_fire(f"{DOMAIN}_spil_status", data)


async def _async_rum(hass: HomeAssistant, call: ServiceCall) -> None:
    """Fælles rum: flere telefoner kan byde ind på samme spil.

    handling = opret | buzz | ryd | luk. Rummets tilstand ligger i hass.data og
    spejles i sensorens attributter, så alle telefoner kan følge den.
    """
    handling = str(call.data.get("handling") or "opret")
    kode = str(call.data.get("kode") or "").strip()[:8]
    navn = str(call.data.get("navn") or "").strip()[:32]
    rum: dict = hass.data.setdefault(DOMAIN, {}).setdefault("rum", {})

    if handling == "opret":
        rum.clear()
        rum.update({"kode": kode or f"{random.randint(1000, 9999)}", "aktiv": True, "buzzere": []})
    elif handling == "buzz":
        if not rum.get("aktiv") or kode != rum.get("kode") or not navn:
            return
        if any(b.get("navn") == navn for b in rum.get("buzzere", [])):
            return
        rum.setdefault("buzzere", []).append(
            {"navn": navn, "tid": datetime.now(UTC).isoformat()}
        )
        rum["buzzere"] = rum["buzzere"][-12:]
    elif handling == "ryd":
        rum["buzzere"] = []
    elif handling == "luk":
        rum.clear()

    data = {
        "rum": rum.get("kode", ""),
        "rum_aktiv": bool(rum.get("aktiv")),
        "rum_buzzere": [b.get("navn") for b in rum.get("buzzere", [])],
        "rum_opdateret": datetime.now(UTC).isoformat(),
    }
    sensor = hass.data.get(DOMAIN, {}).get("sensor")
    if sensor is not None:
        sensor.ny_rum(data)
    hass.bus.async_fire(f"{DOMAIN}_rum", data)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Servér spillets filer og vis panelet i sidebjælken."""
    has_game = await hass.async_add_executor_job((WWW_DIR / "hs.html").is_file)
    if not has_game:
        _LOGGER.error("Spillets filer mangler i %s – installér integrationen igen", WWW_DIR)
        return False

    if not hass.data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(WWW_DIR), False)]
        )
        hass.data[_STATIC_REGISTERED] = True

    if not hass.data.get(_SERVICE_REGISTERED):
        async def _async_status_call(call: ServiceCall) -> None:
            await _async_status(hass, call)

        async def _async_rum_call(call: ServiceCall) -> None:
            await _async_rum(hass, call)

        hass.services.async_register(DOMAIN, "status", _async_status_call)
        hass.services.async_register(DOMAIN, "rum", _async_rum_call)
        hass.data[_SERVICE_REGISTERED] = True

    await hass.config_entries.async_forward_entry_setups(entry, _PLATFORMS)

    async_register_built_in_panel(
        hass,
        "iframe",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=DOMAIN,
        config={"url": PANEL_URL},
        require_admin=False,
        update=True,
    )
    _LOGGER.info("Hyggespil %s er klar – panelet ligger i sidebjælken", VERSION)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Fjern panelet og sensoren. Spillernes data i browseren røres ikke."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, _PLATFORMS)
    if unloaded:
        hass.data.get(DOMAIN, {}).pop("sensor", None)
    async_remove_panel(hass, DOMAIN, warn_if_unknown=False)
    return unloaded
