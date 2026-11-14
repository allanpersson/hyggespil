# Ændringer

Versionerne følger [Semantic Versioning](https://semver.org/lang/da/).

## 0.1.0-beta.3 – 2026-11-14

- Udgivelsespakken indeholder ikke længere udviklerens kildeoversigt (`ledger.json`) – renere pakke og mindre download.
- Hjælpecripts i `tools/` har nu ASCII-navne, så de kan køres på alle systemer.

## 0.1.0-beta.2 – 2026-11-14

- De seneste kildekontrollerede spørgsmål og færdselsregler er med (puljerne er vokset siden beta.1).
- Spillet betjenes nu fra integrationens egne filer (`/hyggespil_files/…`); den tidligere mappe i `config/www/hyggespil` er ikke længere i brug.
- Flere børnespørgsmål til de tynde alderstrin, og retten af en række formularer i feedback- og låsesystemet.

## 0.1.0-beta.1 – 2026-11-14

Første offentlige udgave (beta).

- Home Assistant-integration: spillet vises som panel i sidebjælken og installeres via Marketplace/HACS.
- 55 spil og over 6.000 spørgsmål, opgaver og kort på dansk.
- Alderstilpasning: hvert barn har sit eget niveau, som automatisk bliver sværere eller lettere efter svarene. 🔞 skjules, når en spiller er under 18 år.
- 🔞-sektionen låses med en kode, man selv vælger på hver enhed. Der er ingen fælles kode.
- 💬 Feedback-knap i alle spil, som åbner en færdigudfyldt sag på GitHub. Intet sendes automatisk.
- Ingen eksterne tjenester: spillet henter intet fra internettet.

Kendte begrænsninger står i [README.md](README.md#kendte-begrænsninger-i-betaen).
