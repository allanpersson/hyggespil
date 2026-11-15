"""Indsætter udgivelsens afsnit i CHANGELOG.md – og afviser dubletter.

Brug:
    python tools/indsæt_afsnit.py <version> <fil-med-noter>

Hvis noterne (næsten) ordret står i det nyeste afsnit i forvejen, bruges i stedet
en kort note bygget på commit-beskederne, så samme tekst ikke optræder to gange.
"""
import datetime
import re
import subprocess
import sys

CHANGELOG = "CHANGELOG.md"


def normaliser(tekst: str) -> str:
    return re.sub(r"\s+", " ", tekst).strip().lower()


def afsnit(tekst: str) -> list[str]:
    """Returnér changeloggens afsnit som rå tekst (uden «## »)."""
    return re.split(r"^## ", tekst, flags=re.M)[1:]


def hoved(afsnit_tekst: str) -> str:
    return afsnit_tekst.split("\n", 1)[0].strip()


def rens(noter: str) -> str:
    """Fjern linjer, der kun hører til udgivelsessiden (skillelinje og hentelinje)."""
    ud = []
    for linje in noter.splitlines():
        if re.match(r"^\s*-{3,}\s*$", linje) or linje.lower().startswith("hent: indstillinger"):
            continue
        ud.append(linje)
    return "\n".join(ud).strip()


def dublet(noter: str, gammel: str) -> bool:
    linjer = [normaliser(l) for l in noter.splitlines() if l.strip()]
    if not linjer:
        return True
    gammel = normaliser(gammel)
    return all(l in gammel for l in linjer)


def fra_commits(gammel: str) -> str:
    """Kort note fra commit-beskeder, som ikke allerede står i changelogen."""
    try:
        log = subprocess.run(
            ["git", "log", "-20", "--no-merges", "--pretty=format:%s"],
            capture_output=True, text=True, check=True).stdout
    except Exception:
        return "- Vedligeholdelse og fejlretning."
    spring = ("Udgivelse ", "Henter CI", "Nye spørgsmål", "Overvaagning", "README", "Foelger CI")
    linjer, set_ = [], normaliser(gammel)
    for besked in log.splitlines():
        besked = besked.strip()
        if not besked or besked.startswith(spring):
            continue
        linje = "- " + besked
        if normaliser(linje) in set_ or linje in linjer:
            continue
        linjer.append(linje)
    return "\n".join(linjer) if linjer else "- Vedligeholdelse og fejlretning."


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("brug: python tools/indsæt_afsnit.py <version> <fil-med-noter>")
    version, sti = sys.argv[1], sys.argv[2]
    noter = rens(open(sti, encoding="utf-8").read())
    tekst = open(CHANGELOG, encoding="utf-8").read().replace("\r\n", "\n")

    if re.search(r"^## " + re.escape(version) + r"\b", tekst, flags=re.M):
        print(f"afsnittet for {version} findes allerede – intet indsat")
        return

    gamle = afsnit(tekst)
    forældre = gamle[0] if gamle else ""
    if forældre and dublet(noter, forældre):
        print("noterne står allerede i changelogen – bruger commit-beskeder i stedet")
        noter = fra_commits(forældre)

    nyt = f"## {version} – {datetime.date.today().isoformat()}\n\n{noter}\n"
    i = tekst.find("\n## ")
    tekst = (tekst[:i] + "\n" + nyt + tekst[i:]) if i >= 0 else (tekst + "\n\n" + nyt)
    open(CHANGELOG, "w", encoding="utf-8", newline="\n").write(tekst)
    print(f"changelog: afsnittet {version} indsat med {len(noter.splitlines())} linjer")


if __name__ == "__main__":
    main()
