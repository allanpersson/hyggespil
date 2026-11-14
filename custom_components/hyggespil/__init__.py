"""Hyggespil – selskabsspil til Home Assistant.

Udvikler: Allan Persson · Licens: MIT

Integrationen serverer spillets filer direkte fra sin egen mappe (www/) og viser spillet i et
panel i sidebjælken. Den skriver ingenting i Home Assistants konfiguration og rører ikke
config/www. Spillernavne, aldre, point og grupper gemmes kun i browseren på den enhed, der spilles på.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from homeassistant.components.frontend import (
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL, URL_BASE

_LOGGER = logging.getLogger(__name__)

WWW_DIR = Path(__file__).parent / "www"
_STATIC_REGISTERED = f"{DOMAIN}_static_registered"


def _version() -> str:
    """Returnér den installerede version, så den kan ses i loggen."""
    try:
        return str(json.loads((Path(__file__).parent / "manifest.json").read_text(encoding="utf-8"))["version"])
    except (OSError, ValueError, KeyError):
        return "ukendt"


VERSION = _version()


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
    """Fjern panelet. Spillernes data i browseren røres ikke."""
    async_remove_panel(hass, DOMAIN, warn_if_unknown=False)
    return True
