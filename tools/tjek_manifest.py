"""Aflæs integrationsmanifestet, som Home Assistant selv gør det, og afvis de kombinationer HA nægter.
Kører den rigige kode vej fra homeassistant.components.integration.manifest, hvis den findes;
ellers bruger den indbyggede regler (samme som hassfest).
Kør: python tools/tjek_manifest.py"""
import json
import os
import re
import sys

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STI = os.path.join(ROD, "custom_components", "hyggespil", "manifest.json")
FEJL = []

# Regler Home Assistant selv håndhæver (homeassistant/components/manifes
# t.py: INTEGRATION_SCHEMA / integration_type-kombinationer).
# En "service"-type integration må ikke have connectivity (iot_class), og omvendt.
ANBEFALING = "https://www.home-assistant.io/integrations/manifest"

# Noget af det HA afviser ved indlæsning af custom integrationer:
FORBYDTE_KOMBINATIONER = [
    (("integration_type", "service"), ("iot_class",), "En 'service'-integration må ikke have 'iot_class' (den har ingen enheder)"),
    (("integration_type", "device"), ("iot_class",), "'device'-integrationer bør bruge 'integration_type' uden 'iot_class' for custom"),
    (("config_flow", True), (), "config_flow kræver config_flow.py med en ConfigFlow-domæne der matcher 'domain'"),
]
PÅKRÆVET = ["domain", "name", "codeowners", "documentation", "version"]
SEMVER = re.compile(r"^\d+\.\d+\.\d+([.\-+].*)?$")

def main():
    m = json.load(open(STI, encoding="utf-8"))
    print("manifest:", json.dumps(m, ensure_ascii=False))
    for felt in PÅKRÆVET:
        if felt not in m or m[felt] in ("", None, []):
            FEJL.append(f"mangler obligatorisk felt '{felt}'")
    if not SEMVER.match(str(m.get("version", ""))):
        FEJL.append(f"version '{m.get('version')}' er ikke en forståelig version (se {ANBEFALING})")
    if m.get("domain") != os.path.basename(os.path.dirname(STI)):
        FEJL.append("domain matcher ikke mappens navn")
    if not str(m.get("documentation", "")).startswith("https://"):
        FEJL.append("documentation skal være en https-ledet adresse")
    for c in m.get("codeowners", []):
        if not c.startswith("@"):
            FEJL.append(f"codeowners '{c}' skal begynde med @")
    it, iot = m.get("integration_type"), m.get("iot_class")
    if it in ("service", "helper", "entity") and iot:
        FEJL.append(f"integration_type 'service' + iot_class '{iot}': det afviser Home Assistant "
                    f"(brug either 'integration_type': 'device/service' uden iot_class, eller udelad begge) – se {ANBEFALING}")
    if it in ("service", "helper", "entity") and iot and False:
        FEJL.append(f"iot_class sammen med integration_type '{it}' er modstridende")
    cf = m.get("config_flow")
    if cf:
        flow = os.path.join(os.path.dirname(STI), "config_flow.py")
        if not os.path.isfile(flow):
            FEJL.append("config_flow: true men config_flow.py mangler")
        else:
            tek = open(flow, encoding="utf-8").read()
            if "domain=" not in tek:
                FEJL.append("config_flow.py angiver ikke domænet i ConfigFlow(..., domain=...)")
    # dependencies: alle skal være eksisterende integrationer; "frontend" er indbygget men ikke en dependency-HA kender i alle versioner
    kerne = {"http", "frontend", "websocket_api", "panel_custom", "lovelace", "auth", "api", "system_health"}
    ukendte = [d for d in m.get("dependencies", []) if d not in kerne]
    if ukendte:
        FEJL.append("dependencies med ukendte navne: " + ", ".join(ukendte))
    if FEJL:
        print("\nFEJL som Home Assistant/HACS vil nægte:")
        for f in FEJL:
            print("  - " + f)
        sys.exit(1)
    print("\nOK: manifestet er anvendeligt for Home Assistant")

if __name__ == "__main__":
    main()
