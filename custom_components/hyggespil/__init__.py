"""Hyggespil – selskabsspil til Home Assistant.

Udvikler: Allan Persson · Licens: MIT

Integrationen serverer spillets filer direkte fra sin egen mappe (www/) og viser spillet i et
panel i sidebjælken. Den skriver ingenting i Home Assistants konfiguration og rører ikke
config/www. Spillernavne, aldre, point og grupper gemmes kun i browseren på den enhed, der spilles på.

Spillet kan fortælle Home Assistant, hvad der sker (tjenesten ``hyggespil.status``), så lys og
andre automatiseringer kan bygges på det – se docs/spaending.md.
"""
from __future__ import annotations

import base64
import hashlib
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


def _rc4(key: str, data: bytes) -> bytes:
    """Simpel RC4 til at beskytte et privat kort med spillerens egen nøgle."""
    s = list(range(256))
    k = key.encode("utf-8")
    j = 0
    for i in range(256):
        j = (j + s[i] + k[i % len(k)]) & 255
        s[i], s[j] = s[j], s[i]
    i = j = 0
    ud = bytearray()
    for b in data:
        i = (i + 1) & 255
        j = (j + s[i]) & 255
        s[i], s[j] = s[j], s[i]
        ud.append(b ^ s[(s[i] + s[j]) & 255])
    return bytes(ud)


def _krypt_privat(noegle: str, indhold: dict) -> str:
    """Krypterer et privat kort, så kun den spillers telefon kan læse det."""
    if not noegle:
        return ""
    data = json.dumps(indhold, ensure_ascii=False).encode("utf-8")
    return base64.b64encode(_rc4(noegle, data)).decode("ascii")


def _privat_kort(rum: dict) -> dict:
    """Krypterer hver spillers private kort med netop hans/hendes nøgle."""
    ud: dict = {}
    raw = rum.get("privat_raw") or {}
    for i, spiller in enumerate(rum.get("spillere", [])):
        indhold = raw.get(str(i)) or raw.get(i)
        noegle = spiller.get("noegle") or ""
        if indhold and noegle:
            ud[str(i)] = _krypt_privat(noegle, indhold)
    return ud


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
    """Fælles rum: flere telefoner spiller samme spil.

    handling = opret | deltag | forlad | buzz | ryd | luk | start | svar | naeste | afslut.
    Rummets offentlige tilstand spejles i sensorens attributter. Det rigtige svar
    gemmes kun her på serveren og offentliggøres først, når runden afsløres –
    så ingen telefon kan snyde ved at kigge i sensoren.
    """
    handling = str(call.data.get("handling") or "opret")
    kode = str(call.data.get("kode") or "").strip()[:8]
    navn = str(call.data.get("navn") or "").strip()[:24]
    enhed = str(call.data.get("enhed") or "").strip()[:24]
    noegle = str(call.data.get("noegle") or "").strip()[:64]
    rum: dict = hass.data.setdefault(DOMAIN, {}).setdefault("rum", {})

    def nulstil() -> None:
        rum.clear()
        rum.update({
            "kode": kode or f"{random.randint(1000, 9999)}",
            "aktiv": True,
            "buzzere": [],
            "spillere": [],
            "vaert": enhed,
            "spil": "",
            "fase": "lobby",
            "tur": 0,
            "spoergsmaal": None,
            "korrekt": None,
            "svar": None,
            "privat": {},
            "privat_raw": {},
        })

    def find(enhed_id: str) -> dict | None:
        return next((p for p in rum.get("spillere", []) if p.get("enhed") == enhed_id), None)

    if handling == "opret":
        nulstil()
    elif handling == "deltag":
        if not rum.get("aktiv") or not enhed or not navn:
            return
        if find(enhed) is None and len(rum.get("spillere", [])) < 8:
            brugte = {p.get("navn") for p in rum.get("spillere", [])}
            unikt, n = navn, 2
            while unikt in brugte:
                unikt, n = f"{navn} {n}", n + 1
            rum.setdefault("spillere", []).append(
                {"enhed": enhed, "navn": unikt, "point": 0, "noegle": noegle}
            )
    elif handling == "forlad":
        rum["spillere"] = [p for p in rum.get("spillere", []) if p.get("enhed") != enhed]
        if rum.get("tur", 0) >= len(rum["spillere"]):
            rum["tur"] = 0
    elif handling == "buzz":
        if not rum.get("aktiv") or kode != rum.get("kode") or not navn:
            return
        if any(b.get("navn") == navn for b in rum.get("buzzere", [])):
            return
        rum.setdefault("buzzere", []).append({"navn": navn, "tid": datetime.now(UTC).isoformat()})
        rum["buzzere"] = rum["buzzere"][-12:]
    elif handling == "ryd":
        rum["buzzere"] = []
    elif handling == "luk":
        rum.clear()
    elif handling == "start":
        if not rum.get("spillere") or (rum.get("vaert") and enhed != rum.get("vaert")):
            return
        rum.update({
            "spil": str(call.data.get("spil") or ""),
            "fase": "spoergsmaal",
            "tur": 0,
            "spoergsmaal": call.data.get("spoergsmaal") or None,
            "korrekt": call.data.get("korrekt"),
            "svar": None,
            "privat_raw": call.data.get("privat") or {},
        })
        rum["privat"] = _privat_kort(rum)
        for p in rum["spillere"]:
            p["point"] = 0
    elif handling == "svar":
        if rum.get("fase") != "spoergsmaal" or not rum.get("spillere"):
            return
        aktiv = rum["spillere"][rum.get("tur", 0)]
        if aktiv.get("enhed") != enhed:
            return                      # kun den spiller, hvis tur det er, må svare
        valg = call.data.get("svar")
        rum["svar"] = valg
        if valg is not None and int(valg) == int(rum.get("korrekt")):
            aktiv["point"] = int(aktiv.get("point", 0)) + 1
        rum["fase"] = "afsloret"
    elif handling == "naeste":
        if not rum.get("spillere") or (rum.get("vaert") and enhed != rum.get("vaert")):
            return
        rum["tur"] = (int(rum.get("tur", 0)) + 1) % len(rum["spillere"])
        rum.update({
            "fase": "spoergsmaal",
            "spoergsmaal": call.data.get("spoergsmaal") or rum.get("spoergsmaal"),
            "korrekt": call.data.get("korrekt"),
            "svar": None,
            "privat_raw": call.data.get("privat") or {},
        })
        rum["privat"] = _privat_kort(rum)
    elif handling == "giv":
        if not rum.get("spillere") or (rum.get("vaert") and enhed != rum.get("vaert")):
            return
        idx = call.data.get("spiller")
        idx = int(rum.get("tur", 0)) if idx is None else int(idx)
        if 0 <= idx < len(rum["spillere"]):
            rum["spillere"][idx]["point"] = int(rum["spillere"][idx].get("point", 0)) + 1
    elif handling == "afslut":
        rum.update({"fase": "lobby", "spoergsmaal": None, "korrekt": None, "svar": None,
                    "spil": "", "privat": {}, "privat_raw": {}})

    spillere = rum.get("spillere", [])
    tur = int(rum.get("tur", 0)) if spillere else None
    afsloeret = rum.get("fase") == "afsloret"
    data = {
        "rum": rum.get("kode", ""),
        "rum_aktiv": bool(rum.get("aktiv")),
        "rum_buzzere": [b.get("navn") for b in rum.get("buzzere", [])],
        "rum_spillere": [{"navn": p.get("navn"), "point": p.get("point", 0), "enhed": p.get("enhed")} for p in spillere],
        "rum_tur": tur,
        "rum_tur_navn": spillere[tur]["navn"] if spillere else "",
        "rum_vaert": rum.get("vaert", ""),
        "rum_fase": rum.get("fase", "lobby"),
        "rum_spil": rum.get("spil", ""),
        "rum_spoergsmaal": rum.get("spoergsmaal") if rum.get("fase") in ("spoergsmaal", "afsloret") else None,
        "rum_korrekt": rum.get("korrekt") if afsloeret else None,
        "rum_svar": rum.get("svar") if afsloeret else None,
        "rum_privat": rum.get("privat") or {},
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
