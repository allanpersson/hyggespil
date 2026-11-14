# Finder næste version (x.x.x) ud fra de tags, der allerede findes på GitHub.
#
# Kør:
#   python tools/naeste_version.py "0.2.0 0.1.9" --stabil   -> 0.2.1
#   python tools/naeste_version.py "0.1.0-beta.9 0.1.0-beta.8"  -> 0.1.0-beta.10   (gammel beta-form)
#
# Udgivelser er almindelige x.x.x-versioner: GitHub Marketplace/HACS bruger
# /releases/latest, som springer prereleases over. En prerelease-tag betyder derfor,
# at Marketplace falder tilbage på grenen og viser en commit-SHA i stedet for en version.
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


def _tal(v):
    m = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", (v or "").strip())
    return tuple(int(x) for x in m.groups()) if m else None


def næste_stabil(tags, basis_version):
    """Næste almindelige udgivelse = højeste kendte x.y.z + 1 på patch."""
    tal = [t for t in (_tal(x) for x in list(tags) + [basis_version]) if t]
    stort, lille, patch = max(tal)
    return f"{stort}.{lille}.{patch + 1}"


def højest(tags):
    """Gammel beta-form: højeste x.y.z-beta.N."""
    bedst = None
    for t in tags:
        m = re.match(r"(\d+)\.(\d+)\.(\d+)-beta\.(\d+)$", (t or "").strip())
        if m:
            key = tuple(int(x) for x in m.groups())
            bedst = key if bedst is None or key > bedst else bedst
    return bedst


if __name__ == "__main__":
    a, b, c = (int(x) for x in basis().split("."))
    ind = sys.argv[1] if len(sys.argv) > 1 else ""
    liste = [x for x in re.split(r"[,\s]+", ind) if x]
    if "--stabil" in sys.argv:
        print(næste_stabil(liste, basis()))
        sys.exit(0)
    fundet = højest(liste)
    if fundet and fundet[:3] == (a, b, c):
        print(f"{a}.{b}.{c}-beta.{fundet[3] + 1}")
    else:
        print(f"{a}.{b}.{c}-beta.1")
