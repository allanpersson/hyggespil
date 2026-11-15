# Bygger udgivelses-zippet hyggespil.zip.
#
# VIGTIGT om strukturen: baade Home Assistant Marketplace og HACS pakker zippet ud
# DIREKTE i <config>/custom_components/<domæne> (zip_file.extractall(content.path.local)).
# Zippet skal derfor have integrationens filer i roden – manifest.json, __init__.py,
# www/ osv. – og maa IKKE vaere pakket ind i custom_components/hyggespil/, for saa
# ender manifestet i .../hyggespil/custom_components/hyggespil/manifest.json, og
# Home Assistant melder "The installed content has no usable manifest.json".
#
# Kør:  python tools/make_zip.py [mappe]
import os
import re
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = os.path.join(ROOT, "custom_components", "hyggespil")
# Udgivelsen må ikke indeholde udviklerens egne filer: kildeoversigten og kildetjekkets mellemresultater.
UNDGÅ = {"extra.json", "ledger.json", "verify_state.json", "extra_pending.json", "hs-user-pools.js",
         "github.json", "secrets.json", ".env", ".netrc"}
# Tokens og private nøgler må ikke kunne læses ud af en udgivelse
TOKEN = re.compile(rb"gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----")


def build(dest: str = ROOT) -> str:
    if not os.path.isdir(COMP):
        raise SystemExit("finder ikke custom_components/hyggespil")
    os.makedirs(dest, exist_ok=True)
    out = os.path.join(dest, "hyggespil.zip")
    poster = []
    for base, mapper, filer in os.walk(COMP):
        mapper[:] = sorted(m for m in mapper if m != "__pycache__")
        for f in sorted(filer):
            if f.endswith(".pyc") or f in UNDGÅ:
                continue
            fuld = os.path.join(base, f)
            with open(fuld, "rb") as h:
                if TOKEN.search(h.read()):
                    raise SystemExit(f"FEJL: {os.path.relpath(fuld, ROOT)} ser ud til at indeholde en nøgle")
            poster.append((fuld, os.path.relpath(fuld, COMP).replace(os.sep, "/")))
    # manifest.json først, så et afbrudt download aldrig efterlader en "tom" integration
    poster.sort(key=lambda p: (p[1] != "manifest.json", p[1]))
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for fuld, navn in poster:
            z.write(fuld, navn)
    navne = zipfile.ZipFile(out).namelist()
    if "manifest.json" not in navne:
        raise SystemExit("FEJL: manifest.json ligger ikke i zippets rod")
    print(f"skrev {out}: {len(navne)} filer, {os.path.getsize(out):,} bytes (rod = integrationens filer)")
    return out


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else ROOT)
