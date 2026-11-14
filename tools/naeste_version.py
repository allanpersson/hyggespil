# Finder næste beta-version ud fra de tags, der allerede findes på GitHub.
# Kør:  python tools/naeste_version.py "0.1.0-beta.9 0.1.0-beta.8"   -> 0.1.0-beta.10
#       python tools/naeste_version.py ""                            -> 0.1.0-beta.1
# Basisversionen (0.1.0) står i custom_components/hyggespil/manifest.json og er BEVIDST uden
# beta-suffix: CI udleder beta-nummeret alene fra tags'ene og behøver dermed aldrig at skrive
# versionsfeltet tilbage til main.
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROD, "custom_components", "hyggespil", "manifest.json")


def basis():
    v = json.load(open(MANIFEST, encoding="utf-8"))["version"]
    m = re.match(r"(\d+\.\d+\.\d+)", v)
    return m.group(1) if m else "0.1.0"


def højest(tags):
    bedst = None
    for t in tags:
        m = re.match(r"(\d+)\.(\d+)\.(\d+)-beta\.(\d+)$", (t or "").strip())
        if not m:
            continue
        key = tuple(int(x) for x in m.groups())
        if bedst is None or key > bedst:
            bedst = key
    return bedst


if __name__ == "__main__":
    a, b, c = (int(x) for x in basis().split("."))
    ind = sys.argv[1] if len(sys.argv) > 1 else ""
    fundet = højest(re.split(r"[,\s]+", ind))
    if fundet and fundet[:3] == (a, b, c):
        print(f"{a}.{b}.{c}-beta.{fundet[3] + 1}")
    else:
        print(f"{a}.{b}.{c}-beta.1")
