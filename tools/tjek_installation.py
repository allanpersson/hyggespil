"""Simulér Home Assistants installation af zippet – uden Home Assistant.

Både Home Assistant Marketplace og HACS pakker zippet ud direkte i
<config>/custom_components/<domæne> (zip_file.extractall(content.path.local)) og
kræver derefter, at der ligger et manifest.json netop der. Det tjekkes her.

Kør:
    python tools/tjek_installation.py                  # bygger og tester zippet
    python tools/tjek_installation.py <sti-til-zip>    # tester et hentet zip (fx udgivelsens asset)
"""
import json
import os
import re
import shutil
import sys
import tempfile
import zipfile

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMÆNE = "hyggespil"


def tjek(zip_sti: str) -> list[str]:
    fejl = []
    with zipfile.ZipFile(zip_sti) as z:
        navne = z.namelist()
        if "custom_components/" in " ".join(navne):
            fejl.append("zippet har en indpakket rod (custom_components/...), men udpakkes direkte i "
                        "custom_components/hyggespil – manifest.json ender det forkerte sted")
        if "manifest.json" not in navne:
            fejl.append("manifest.json ligger ikke i zippets rod")
        if not any(n.startswith("www/") and n.endswith("hs.html") for n in navne):
            fejl.append("www/hs.html mangler – spillet ville ikke kunne vises")

        # Udpak præcis som Home Assistant gør: hele zippet ned i integrationsmappen.
        tmp = tempfile.mkdtemp()
        lokal = os.path.join(tmp, "custom_components", DOMÆNE)
        os.makedirs(lokal)
        try:
            z.extractall(lokal)
        finally:
            pass
        man = os.path.join(lokal, "manifest.json")
        if not os.path.isfile(man):
            fejl.append(f"efter udpakning findes {lokal}/manifest.json ikke (det er den fejl, "
                        f"Home Assistant melder: 'no usable manifest.json')")
        else:
            m = json.load(open(man, encoding="utf-8"))
            if m.get("domain") != DOMÆNE:
                fejl.append(f"manifestets domain er {m.get('domain')!r}, mappen heder {DOMÆNE!r}")
            if not re.fullmatch(r"\d+\.\d+\.\d+", str(m.get("version", ""))):
                fejl.append(f"manifestets version {m.get('version')!r} er ikke x.x.x "
                            f"(Home Assistant afviser den som 'ikke en brugbar version')")
        shutil.rmtree(tmp, ignore_errors=True)
    return fejl


if __name__ == "__main__":
    if len(sys.argv) > 1:
        sti = sys.argv[1]
    else:
        sys.path.insert(0, os.path.join(ROD, "tools"))
        from make_zip import build

        sti = build(os.path.join(ROD, "udg"))
    fejl = tjek(sti)
    print(f"tjekkede {sti}")
    if fejl:
        for f in fejl:
            print("  FEJL: " + f)
        sys.exit(1)
    print("OK: zippet kan installeres af Marketplace/HACS (manifest.json i roden, version x.x.x)")
