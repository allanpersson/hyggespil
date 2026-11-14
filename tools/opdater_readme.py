"""Holder README opdateret med version og ændringslog.

- Versionen i README kommer fra custom_components/hyggespil/manifest.json.
- «Nyheder» i README kommer fra CHANGELOG.md (de nyeste versioner, nyeste først).

Kør:
    python tools/opdater_readme.py          # skriv ændringerne i README.md
    python tools/opdater_readme.py --tjek   # fejl, hvis README ikke er i sync (bruges i CI)
"""
import json
import os
import re
import sys

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
README = os.path.join(ROD, "README.md")
MANIFEST = os.path.join(ROD, "custom_components", "hyggespil", "manifest.json")
CHANGELOG = os.path.join(ROD, "CHANGELOG.md")
ANTAL_VERSIONER = 8

VERSION_START = "<!-- version:start -->"
VERSION_SLUT = "<!-- version:end -->"
NYHEDER_START = "<!-- nyheder:start -->"
NYHEDER_SLUT = "<!-- nyheder:end -->"


def version() -> str:
    return str(json.load(open(MANIFEST, encoding="utf-8"))["version"])


def afsnit() -> list[tuple[str, str, list[str]]]:
    """Del CHANGELOG i (version, dato, linjer) pr. «## version - dato»."""
    tekst = open(CHANGELOG, encoding="utf-8").read().replace("\r\n", "\n")
    dele = re.split(r"^## ", tekst, flags=re.M)[1:]
    ud = []
    for del_ in dele:
        linjer = del_.split("\n")
        hoved = linjer[0].strip()
        m = re.match(r"([0-9][^\s]*)\s+[–-]\s+(.+)$", hoved)
        if not m:
            continue
        ud.append((m.group(1), m.group(2).strip(), [l.rstrip() for l in linjer[1:]]))
    return ud


def ryd(linjer: list[str]) -> str:
    """Fjern tomme linjer i toppen/bunden, behold formatering."""
    while linjer and not linjer[0].strip():
        linjer.pop(0)
    while linjer and not linjer[-1].strip():
        linjer.pop()
    return "\n".join(linjer)


def ønsket_indhold() -> tuple[str, str]:
    v = version()
    version_linje = f"· **Version:** {v}"
    dele = []
    stabile = [a for a in afsnit() if "-beta" not in a[0]]
    for navn, dato, linjer in stabile[:ANTAL_VERSIONER]:
        krop = ryd(linjer)
        krop = "\n".join(
            f"**{linje[4:].strip()}**" if linje.startswith("### ") else linje for linje in krop.split("\n")
        )
        dele.append(f"### {navn} – {dato}\n\n{krop}".strip())
    nyheder = "\n\n".join(dele)
    nyheder += ("\n\nÆldre versioner (beta) og hele historikken: [CHANGELOG.md](CHANGELOG.md) · "
                "[alle udgivelser](https://github.com/allanpersson/hyggespil/releases)")
    return version_linje, nyheder


def udskift(tekst: str, start: str, slut: str, nyt: str, inline: bool = False) -> str:
    mønster = re.compile(re.escape(start) + r".*?" + re.escape(slut), re.S)
    if not mønster.search(tekst):
        raise SystemExit(f"FEJL: markerne {start} / {slut} findes ikke i README.md")
    erstatning = start + (nyt if inline else "\n" + nyt + "\n") + slut
    return mønster.sub(erstatning, tekst)


def main() -> None:
    tjek = "--tjek" in sys.argv
    tekst = open(README, encoding="utf-8").read()
    version_linje, nyheder = ønsket_indhold()
    ny = udskift(tekst, VERSION_START, VERSION_SLUT, version_linje, inline=True)
    ny = udskift(ny, NYHEDER_START, NYHEDER_SLUT, nyheder)

    if ny == tekst:
        print(f"README er i sync (version {version()})")
        return
    if tjek:
        print("FEJL: README.md er ikke opdateret – kør: python tools/opdater_readme.py")
        sys.exit(1)
    open(README, "w", encoding="utf-8", newline="\n").write(ny)
    print(f"README opdateret: version {version()}, {len(nyheder.splitlines())} linjer nyheder")


if __name__ == "__main__":
    main()
