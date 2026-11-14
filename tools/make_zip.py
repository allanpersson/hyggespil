# Laver udgivelses-zippet hyggespil.zip med den struktur, HACS/Marketplace forventer.
# Kør:  python tools/make_zip.py [mappe]
# Normalt behøves det ikke lokalt: .github/workflows/release.yml laver zippet selv ved hver udgivelse.
# Scriptet bruges af tools/publish.js, når en udgivelse laves fra denne pc.
import os
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = os.path.join(ROOT, "custom_components", "hyggespil")
# Udgivelsen må ikke indeholde udviklerens egne filer: kildeoversigten og kildetjekkets mellemresultater.
UNDGÅ = {"ledger.json", "verify_state.json", "extra_pending.json", "hs-user-pools.js"}


def build(dest: str = ROOT) -> str:
    if not os.path.isdir(COMP):
        raise SystemExit("finder ikke custom_components/hyggespil")
    os.makedirs(dest, exist_ok=True)
    out = os.path.join(dest, "hyggespil.zip")
    staging = os.path.join(dest, "_zip_staging")
    target = os.path.join(staging, "custom_components", "hyggespil")
    shutil.rmtree(staging, ignore_errors=True)
    shutil.copytree(COMP, target, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    for s in UNDGÅ:
        p = os.path.join(target, "www", s)
        if os.path.exists(p):
            os.remove(p)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for base, _, files in os.walk(staging):
            for f in sorted(files):
                p = os.path.join(base, f)
                z.write(p, os.path.relpath(p, staging).replace(os.sep, "/"))
    shutil.rmtree(staging, ignore_errors=True)
    n = len(zipfile.ZipFile(out).namelist())
    print(f"skrev {out}: {n} filer, {os.path.getsize(out):,} bytes")
    return out


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else ROOT)
