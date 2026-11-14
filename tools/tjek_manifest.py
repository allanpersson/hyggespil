"""Tjek manifestet med de samme regler, som hassfest/Home Assistant bruger.

Kilde: home-assistant/core, script/hassfest/manifest.py (INTEGRATION_MANIFEST_SCHEMA
og validate_manifest). Reglerne her er skrevet, så de fejler præcis der, hvor
hassfest-fejlen "Domain is missing an IoT Class" og lignende opstår – så en udgivelse
ikke kan gå igennem med et manifest, CI eller Home Assistant afviser.

Kør: python tools/tjek_manifest.py
"""
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STI = os.path.join(ROD, "custom_components", "hyggespil", "manifest.json")
ANBEFALING = "https://developers.home-assistant.io/docs/creating_integration_manifest"

# homeassistant.const.IntegrationType (custom-integrationer må ikke bruge "virtual")
TYPER = {"device", "entity", "hardware", "helper", "hub", "service", "system"}
# script/hassfest/manifest.py: SUPPORTED_IOT_CLASSES
IOT_KLASSER = {"assumed_state", "calculated", "cloud_polling", "cloud_push", "local_polling", "local_push"}
PÅKRÆVET = ["domain", "name", "codeowners", "documentation", "version"]
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
KERNE_AFHÆNGIGHEDER = {"http", "frontend", "websocket_api", "panel_custom", "lovelace", "auth", "api", "system_health"}


def main():
    m = json.load(open(STI, encoding="utf-8"))
    print("manifest:", json.dumps(m, ensure_ascii=False))
    fejl = []
    for felt in PÅKRÆVET:
        if felt not in m or m[felt] in ("", None, []):
            fejl.append(f"mangler obligatorisk felt '{felt}'")
    if not SEMVER.match(str(m.get("version", ""))):
        fejl.append(f"version '{m.get('version')}' er ikke x.x.x (kræves af Marketplace-udgivelser)")
    if m.get("domain") != os.path.basename(os.path.dirname(STI)):
        fejl.append("domain matcher ikke mappens navn")
    if not str(m.get("documentation", "")).startswith("https://"):
        fejl.append("documentation skal begynde med https://")
    for c in m.get("codeowners", []):
        if not str(c).startswith("@"):
            fejl.append(f"codeowners '{c}' skal begynde med @")

    it = m.get("integration_type", "hub")
    iot = m.get("iot_class")
    if it not in TYPER:
        fejl.append(f"integration_type '{it}' er ikke en af: {', '.join(sorted(TYPER))}")
    # hassfest: "Domain is missing an IoT Class" – gælder alle typer undtagen virtual
    if not iot:
        fejl.append("'iot_class' mangler – hassfest fejler med \"Domain is missing an IoT Class\" "
                    "(brug fx 'calculated')")
    elif iot not in IOT_KLASSER:
        fejl.append(f"iot_class '{iot}' er ikke en af: {', '.join(sorted(IOT_KLASSER))}")

    if m.get("config_flow"):
        flow = os.path.join(os.path.dirname(STI), "config_flow.py")
        if not os.path.isfile(flow):
            fejl.append("config_flow: true men config_flow.py mangler")
        elif "ConfigFlow" not in open(flow, encoding="utf-8").read():
            fejl.append("config_flow.py har ingen ConfigFlow-klasse")

    ukendte = [d for d in m.get("dependencies", []) if d not in KERNE_AFHÆNGIGHEDER]
    if ukendte:
        fejl.append("dependencies med ukendte navne: " + ", ".join(ukendte))

    if fejl:
        print("\nFEJL som hassfest/Home Assistant vil afvise:")
        for f in fejl:
            print("  - " + f)
        print("  læs mere: " + ANBEFALING)
        sys.exit(1)
    print("\nOK: manifestet opfylder hassfests regler")


if __name__ == "__main__":
    main()
