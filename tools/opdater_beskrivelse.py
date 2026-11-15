"""Opdaterer GitHub-beskrivelsen med de rigtige tal.

Beskrivelsen vises i HACS/Marketplace under integrationens navn. Den bygges ud fra
docs/antal.json (skrevet af tools/antal.js), så den altid følger indholdet.

Kør:
    python tools/opdater_beskrivelse.py            # opdater GitHub
    python tools/opdater_beskrivelse.py --vis      # vis bare teksten
"""
import json
import os
import subprocess
import sys
import urllib.request

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANTAL = os.path.join(ROD, "docs", "antal.json")
REPO = "allanpersson/hyggespil"


def token() -> str:
    t = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if t:
        return t.strip()
    fil = os.path.join(ROD, "tools", "secrets", "github.json")
    return json.load(open(fil, encoding="utf-8"))["token"].strip()


def tal() -> dict:
    subprocess.run(["node", os.path.join(ROD, "tools", "antal.js")], check=True,
                   cwd=ROD, capture_output=True)
    return json.load(open(ANTAL, encoding="utf-8"))


def tekst(t: dict) -> str:
    kort = f"{t['spoergsmaal']:,}".replace(",", ".")
    return (f"Danske selskabsspil til Home Assistant: {t['spil']} spil og {kort} "
            "spørgsmål, opgaver og kort. Kører helt lokalt – ingen konto, ingen eksterne tjenester.")


def main() -> None:
    t = tal()
    beskrivelse = tekst(t)
    if "--vis" in sys.argv:
        print(beskrivelse)
        return
    krop = json.dumps({"description": beskrivelse}).encode("utf-8")
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}", data=krop, method="PATCH",
                                 headers={"Authorization": "Bearer " + token(),
                                          "Accept": "application/vnd.github+json",
                                          "Content-Type": "application/json",
                                          "User-Agent": "hyggespil"})
    try:
        with urllib.request.urlopen(req) as r:
            print(f"beskrivelse opdateret (HTTP {r.status}): {beskrivelse}")
    except urllib.error.HTTPError as e:
        # CI's egen GITHUB_TOKEN må ikke ændre beskrivelsen (kræver admin); det må ikke vælte en udgivelse
        print(f"kunne ikke opdatere beskrivelsen (HTTP {e.code}) – kør scriptet lokalt i stedet")
        if e.code != 403:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
