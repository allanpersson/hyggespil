# Ændringer

Versionerne følger [Semantic Versioning](https://semver.org/lang/da/). Alle udgivelser er indtil videre
markeret som prerelease (beta), fordi indholdet løbende udvides og afprøves af spillere.

## 0.1.0-beta.5 – 2026-11-14

- Renhed i repoet: den byggede udgivelsespakke (`out/hyggespil.zip`) er taget ud af git igen. Indholdet af spillet er uændret.

## 0.1.0-beta.4 – 2026-11-14

- CHANGELOG for de to foregående udgivelser, så versionshistorikken kan læses ét sted.
- Hjælpe-scripts i `tools/` har ASCII-navne og kan køres på tværs af systemer.

## 0.1.0-beta.3 – 2026-11-14

- Udgivelsespakken indeholder ikke længere udviklerens kildeoversigt (`ledger.json`) – renere pakke og mindre download.

## 0.1.0-beta.2 – 2026-11-14

- De seneste kildekontrollerede spørgsmål og færdselsregler er med (puljerne er vokset siden beta.1).
- Spillet betjenes fra integrationens egne filer (`/hyggespil_files/…`); den tidligere mappe i `config/www/hyggespil` er ikke længere i brug.

## 0.1.0-beta.1 – 2026-11-14

Første udgave.

- Home Assistant-integration med panel i sidebjælken, opsætning via Marketplace/HACS.
- 55 spil og over 6.000 spørgsmål, opgaver og kort på dansk.
- Alderstilpasning: hvert barn spiller på sit eget niveau, der bliver sværere ved mange rigtige svar og lettere ved få.
- 🔞-afsnit bag en kode, man selv vælger på enheden – ingen fælles kode i kildekoden.
- 💬 Feedback-knap i alle spil, der åbner en færdigudfyldt GitHub-sag. Intet sendes automatisk.
- Kører helt lokalt: ingen eksterne tjenester, ingen statistik, spillernes data forlader ikke enheden.
