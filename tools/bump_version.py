# Hæver versionen ét trin (beta-nummer) i både manifest.json og spillets hs-cfg.js.
# Kør:  python tools/bump_version.py            – viser hvad der ville ske
#        python tools/bump_version.py --skriv   – skriver det
# Efter skriv: node tools/build.js check, git commit, node tools/update_remote.js, og lav en release.
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "custom_components", "hyggespil", "manifest.json")
CFG = os.path.join(ROOT, "custom_components", "hyggespil", "www", "hs-cfg.js")
SKRIV = "--skriv" in sys.argv


def naeste(v):
    m = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)-beta\.(\d+)", v)
    if m:
        a, b, c, n = map(int, m.groups())
        return f"{a}.{b}.{c}-beta.{n + 1}"
    m = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", v)
    if m:
        a, b, c = map(int, m.groups())
        return f"{a}.{b}.{c + 1}"
    raise SystemExit("kan ikke læse versionen: " + v)


m = json.load(open(MANIFEST, encoding="utf-8"))
nu, cfg_tekst = m["version"], open(CFG, encoding="utf-8").read()
gamle_cfg = re.search(r"version:'([\w.\-]+)'", cfg_tekst).group(1)
ny = naeste(nu)
print(f"nu: manifest={nu}, hs-cfg={gamle_cfg}  →  ny: {ny}")
if nu != gamle_cfg:
    raise SystemExit("AVBRUTT: de to felter er allerede forskellige – ret dem manuelt først.")
if not SKRIV:
    print("( viser kun – brug --skriv for at ændre )")
    sys.exit(0)

m["version"] = ny
nøgler = ["domain", "name"] + sorted(k for k in m if k not in ("domain", "name"))
open(MANIFEST, "w", encoding="utf-8").write(json.dumps({k: m[k] for k in nøgler}, indent=2, ensure_ascii=False) + "\n")
open(CFG, "w", encoding="utf-8").write(cfg_tekst.replace(f"version:'{gamle_cfg}'", f"version:'{ny}'"))
print(f"skrevet version {ny}. Kør nu: node tools/build.js check")
