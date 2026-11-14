"""Sensor med Hyggespils tilstand, så lys og andre automatiseringer kan følge spillet.

Spillet (panelet) kalder tjenesten ``hyggespil.status``, når et spil starter, når
nedtællingen tikker, og når det slutter. Denne sensor viser tilstanden og de tal,
en automatisering har brug for – bl.a. ``sekunder``, ``urgency`` (0-1) og ``puls`` (0-1).
Der sendes også en hændelse, ``hyggespil_spil_status``, med samme data.
"""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

# Felter spillet kan sende; de bliver til attributter på sensoren
FELTER = ("spil", "spil_navn", "spillere", "sekunder", "tid", "urgency", "puls", "musik")


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Opret sensoren for denne post."""
    sensor = HyggespilSpilSensor()
    hass.data.setdefault(DOMAIN, {})["sensor"] = sensor
    async_add_entities([sensor])


class HyggespilSpilSensor(SensorEntity):
    """Hyggespils tilstand: klar, spiller eller slut."""

    _attr_name = "Hyggespil spil"
    _attr_unique_id = "hyggespil_spil"
    _attr_icon = "mdi:dice-multiple"
    _attr_should_poll = False

    def __init__(self) -> None:
        """Start som klar."""
        self._attr_native_value = "klar"
        self._attr_extra_state_attributes: dict = {}

    async def async_added_to_hass(self) -> None:
        """Gør sensoren kendt, så tjenesten kan opdatere den."""
        self.hass.data.setdefault(DOMAIN, {})["sensor"] = self

    def ny_status(self, data: dict) -> None:
        """Gem ny tilstand fra spillet og skriv den til Home Assistant."""
        self._attr_native_value = str(data.get("state") or "klar")
        self._attr_extra_state_attributes = {
            noegle: data[noegle] for noegle in FELTER if noegle in data
        }
        if self.hass is not None:
            self.async_write_ha_state()
