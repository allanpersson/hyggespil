# Ændringer

Versionerne følger [Semantic Versioning](https://semver.org/lang/da/).

## 0.1.0-beta.12 – 2026-11-14

- Opdater hs-cfg.js
- Genskaber ci_koersel.js
- Genskaber ci_fejl.js
- Opdater hs-cfg.js
- Opdater CHANGELOG.md
- Opdater udgiv.yml
- Genskaber genskab_main.js
## 0.1.0-beta.8 – 2026-11-14

### Tilføjet
- 🔐 **Kodespil** (8 spil): Zodiac-agtige glyfer, gridskrift, punktskrift, farvekoder, morse, Cæsars brev, spejlbrev og bogstavkæde. Facit genereres af koden, så det viste altid matcher svaret.
- 🔤 **Ordspil** (9 spil): ord af bogstaver, ordkæde, ordtrappe, ordsplit, baglænsord, rim, længste ord, stavboks og staveling. Alle kæder/trapper/rim er verificeret af `tools/gransk_ordspil.js`.
- 🧮 **Tal & matematik** (8 spil): hvilket tal er tænkt, hovedregning, talrækker, overslag, procent, sanseprøve, ur & tid, bogstavværdi – facit udregnet, aldrig slået op.
- Første gangs start: ny bruger vælger sin egen 🔞-kode (4–8 cifre) og får to spillere (Spiller 1 / Spiller 2) i gruppen Standard. Ingen data fra udvikleren følger med.
- ➕ «Foreslå spørgsmål»: sendes til udvikleren som GitHub-sag (med svar, kilde og målgruppe) og bliver **ikke** lagt i puljerne lokalt – først efter relevansvurdering og kildekontrol.
- 💾 Sikkerhedskopi: «👥 Spillere → Sikkerhedskopi / Genskab fra kopi» eksporterer og genopretter alt det, spillet gemmer på enheden.

### Ændret
- 🦑 Dødsspils-leg hedder nu **Squid Games**.
- 🌉 Glasbroen vises fra den side, man står på (man starter oppe i den fjerne ende og går ned mod os) med glasfliser i perspektiv, glød på den rigtige flise og fald-animation.
- 🎡 Lykkehjulets felter har nu stablede, oprejste bogstaver i stedet for skrå tekst (designreferencen er det oprindelige hjul fra 1988 – se THIRD_PARTY_NOTICES).
- Kun det sidste afbrudte spil kan fortsættes (oversigten viser én række).
- «← Alle spil» lander nu ved det spil, man kom fra, i stedet for øverst på forsiden.
- Tekster om «automatisk udvidelse hver dag» er fjernet, så de ikke gælder for private installationer.

### Sikkerhed og data
- Natjobbene skriver ikke længere i `config/www/hyggespil`; spillets filer ligger i integrationens egen mappe og køres fra GitHub.
- `ledger.json` (kildeoversigt), `verify_state.json`, `extra_pending.json`, `hs-user-pools.js` og `extra.json` er taget ud af den offentlige udgivelse.
- `tools/secrets/` (nøgler) er optaget i `.gitignore`, og udgivelseszippet ligger ikke længere i grenen – kun som release-asset.

## 0.1.0-beta.3 – 2026-11-14
