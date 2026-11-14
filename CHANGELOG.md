# Ændringer

Versionerne følger [Semantic Versioning](https://semver.org/lang/da/).

## 0.2.9 – 2026-11-14

### Rettet
- **«← Alle spil» lander nu ved det spil, du kom fra** – også når du fortryder i indstillingsboksen, før spillet er startet. Før røg man til toppen af forsiden. Der rulles til selve spillkortet (med luft over), og der prøves igen efter et øjeblik, så det også virker på mobil.

## 0.2.8 – 2026-11-14

### Ændret
- 🎵 **Lydene er nu rigtige optagelser** fra OpenGameArt i stedet for egen syntese: dyb spændingsflade, fare på vej, ur der tikker, langsomt ur, hjerteslag, krigstrommer, drama-sting, filmisk whoosh, forkert svar, sejr og fanfare – 11 optagelser plus «tid er gået». De er trimmet og lydnormaliseret (MP3, 96 kbps, ca. −16 LUFS).
- Licenserne er CC0 og CC-BY. CC-BY-filerne er krediteret i [docs/lyd.md](docs/lyd.md), `THIRD_PARTY_NOTICES.md` og `custom_components/hyggespil/www/lyd/CREDITS.txt`, som følger med udgivelsen.

### Tilføjet
- ☕ **Støt projektet** – Buy Me a Coffee-badge i README og i spillets feedback-fod.
- `tools/hent_lyde.py` henter, trimmer og koder lydene igen og genskaber krediteringsfilen.

## 0.2.7 – 2026-11-14

### Rettet
- 🎡 **Lykkehjulet er bygget om efter det danske tv-hjul**: 24 felter, samme farver og værdier (inkl. FALLIT, TABT TUR og JOKER), gråt nav og kant, og tekst der står radialt og følger hjulet. Skriftstørrelsen tilpasses feltet, så intet stikker ud eller forsvinder. `KR` er fjernet, da det rodede billedet.

### Ændret
- 🎵 **Lydene er lavet helt om og er nu meget mere dramatiske**: braam (dybe, let forvrængede strygerstakke), pauke, stryger-tremolo, bækken-svulm, riser og rumklang i stedet for tynde sinustoner. 16 lyde, ca. 0,95 MB.
- Oplæsningens to felter er nu **valglister med installationens egne enheder** (`tts.*` og `media_player.*`) i stedet for fritekst.

### Tilføjet
- **← Alle spil** i indstillingsboksen, så man kan forlade den uden at starte et spil.

## 0.2.6 – 2026-11-14

### Tilføjet
- 🎵 **15 indbyggede drama- og quizlyde**: dyb spænding, tikken, hjerteslag, hviskende luft, rolig marimba, xylofon-motiv, stigende spænding, trommehvirvel, Pauke, mystisk klokke, quiz-intro, sejr, forkert svar, nedtælling og «tid er gået». Vælges i indstillingerne med **Prøv lyd**; seks af dem kan loope.
- **🎵/🔇-knap** i spillets bjælke slår musikken til og fra med ét tryk – musikken kan altid fravælges, også midt i en runde.
- Lydene er **syntetiseret fra bunden** (`tools/lav_lyde.py`), så de er projektets egne (MIT) og kan bruges frit. Se [docs/lyd.md](docs/lyd.md).

### Ændret
- Mens oplæsningen taler, **dæmpes musikken** til ca. 14 % i stedet for at stoppe, så spørgsmålet altid kan høres – og musikken går op igen bagefter.

## 0.2.5 – 2026-11-14

### Tilføjet
- 🔊 **Oplæsning af spørgsmål** – læs spørgsmålet højt, når det vises. Vælg stemme og hastighed i indstillingerne; **🔊** i spillets bjælke læser igen, og et tryk mere stopper. Virker med enhedens egne stemmer (intet sendes ud) eller gennem en Home Assistant-højttaler via `tts.speak`. Se [docs/oplaesning.md](docs/oplaesning.md).
- Spil hvor oplæsning ville afsløre svaret (Forbudte ord, Gæt og vis, Lykkehjulet) og bræt-/3D-spillene læses ikke op.

### Ændret
- **Udgivelsesnoterne viser nu ændringerne** direkte i Marketplace i stedet for «Se CHANGELOG.md», og udgivelserne hedder bare «Hyggespil» ved siden af versionsnummeret.
- README henter version og ændringslog automatisk og fejler i CI, hvis den kommer bagud.

## 0.2.4 – 2026-11-14

### Rettet
- 🎡 **Lykkehjulet**: bogstaver og tal står nu altid op på skærmen – også efter hjulet har drejet – og ordet læses i den rigtige rækkefølge (venstre→højre eller oppefra→ned), uanset hvor på hjulet feltet står.
- README viser nu den installerede version og ændringslogen for de nyeste udgivelser, og CI fejler, hvis den kommer bagud.

### Ændret
- Udgivelsesworkflowen skriver ikke interne commit-beskeder (CI, README, oprydning) i ændringslogen.

## 0.2.3 – 2026-11-14

### Tilføjet
- ⏱️ **Nedtælling pr. spørgsmål** – vælg 30/45/60/90/120 sekunder eller din egen tid, før spillet starter. Ringen nederst skifter fra blå til gul til rød og bipper ved udløb.
- ⚡ **Ekstra point for hurtigt svar** – 0-3 point, hvis svaret falder inden for det valgte antal sekunder (én gang pr. spiller pr. spørgsmål).
- 🎵 **Spændingsmusik** – en lokal lydfil, der spiller de sidste sekunder af nedtællingen. Gemmes kun på enheden (maks. 8 MB).
- 📡 **`sensor.hyggespil_spil`** med `spil`, `sekunder`, `tid`, `urgency`, `puls`, `spillere` og `musik`, plus tjenesten `hyggespil.status` og hændelsen `hyggespil_spil_status`.
- 🔆 **Blueprint** «Hyggespil – spænding i lyset»: lyset pulserer med stigende hastighed og udsving, jo tættere på udløb man er.
- 📖 [docs/spaending.md](docs/spaending.md) med opsætning, attributter og egne automatiseringer.

### Ændret
- README viser nu altid den installerede version og ændringslogen for de nyeste udgivelser – den opdateres automatisk ved hver udgivelse.

## 0.2.2 – 2026-11-14

### Rettet
- hassfest afviste manifestet («Domain is missing an IoT Class») – `iot_class: calculated` er tilbage.
- CI skubber robust (rebase og gentag), og synkroniseringen laver ét commit i stedet for ét pr. fil.
- Ny overvågning af filer, udgivelse og CI (`tools/overvaag.js`).

## 0.2.1 – 2026-11-14

### Rettet
- Versionsnummeret nederst på spillets forside følger nu udgivelsen.

## 0.2.0 – 2026-11-14

### Rettet
- **Marketplace/HACS kunne ikke installere**: udgivelseszippet var pakket ind i `custom_components/hyggespil/`, men udpakkes direkte i `custom_components/hyggespil`. Nu ligger `manifest.json` i zippets rod.
- Versioner er rene `x.x.x` (ikke prereleases), så Marketplace viser en version i stedet for en commit-SHA.
- Nye CI-tjek: `tools/tjek_installation.py` (udpakker som Marketplace/HACS) og `tools/tjek_manifest.py` (hassfests regler).

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
