# Ændringer

Versionerne følger [Semantic Versioning](https://semver.org/lang/da/).

## 0.2.25 – 2026-11-15

### Rettet
- **Indstillingerne huskes nu** og gemmes på enheden. Boksen vises kun, første gang du starter et spil – derefter åbner du den med **⚙** i spillets bjælke. Du vælger selv, om ændringerne skal gælde **kun dette spil** eller **alle spil**.
- **Oplæsning er slået til som standard** og bruger den enhed, du spiller på. Musik, bip og oplæsning kan sagtens køre samtidig med lys-automationen.
- **Al tekst er gennemgået:** ødelagte tegn og skjulte kontroltegn i puljerne er fjernet, og afkortede forklaringer er ryddet op. «Græker eller sygdom» har nu 73 rene poster.
- **Krypteringen er nu UTF-8**, så æ, ø, å og – bevares ordret i alle puljer.
- **Beskrivelsen af appen** viser de rigtige tal (91 spil og 8.174 spørgsmål) og opdateres ved hver udgivelse.

## 0.2.24 – 2026-11-15

### Tilføjet
- 🪢 **Hangman** og 🎭 **Gæt og grimasser** – to nye spil under Party & leg.

### Ændret
- **README** viser nu selv antallet af spil og spørgsmål (91 spil, 8.212 kort) og opdateres ved hver udgivelse.

## 0.2.23 – 2026-11-15

### Ændret
- Forberedelse af de to nye spil – indholdet i puljerne var uændret i forhold til 0.2.22.

## 0.2.22 – 2026-11-15

### Tilføjet
- **818 nye spørgsmål og kort** fordelt på: Ord og rim (74), Mest sandsynlig (børn) (66), Hvad ville du helst? (børn) (66), Hvad hører ikke til? (66), Sandt eller falsk (børn) (64), Hvilket dyr er jeg? (64), Gør som dyret (64), Børnegåder (64), Gæt og vis (børn) (60), Tæl og gæt (60), Børnequiz (49), Færdselsloven (20), Dalgona (11), Hvem i familien? (11), Postnummer-quiz (10), Byer (5), Sandt eller falsk (5), Tal & gæt (4), Find løgnen (4), Hvad skete først? (4), Hvem/hvad er jeg? (4), Mærkelige ord (4), Hvilket sprog? (4), Skøre rekorder (4), Love & regler (4) samt mindre tilføjelser i Hellere end, Jeg har aldrig, Mest sandsynlig, Udfordringer, Dybe samtaler, Forbudte ord, Gæt og vis, Destination, Stormester og Dystre valg.

## 0.2.21 – 2026-11-14

### Rettet
- 🍾 **Flasken** er en rigtig SVG-flaske (kork, skuldre, krop, etiket), kan lades længere op og rammer alle spillere med præcis lige stor chance (krypto-valg).
- 🔍 **Kvalitetskontrollen** tjekker nu også sprog og grammatik via LanguageTool.

### Ændret
- **Børnepuljerne** udvides automatisk med 20 kort pr. aldersgruppe (3–5, 6–8, 9–11, 12–14) — første runde gav 241 nye kort.
## 0.2.19 – 2026-11-14

### Rettet
- 🍾 **Flasken ligner nu en rigtig flaske** (kork, skuldre, krop, etiket og lys) i stedet for en grøn kapsel, og den er tilpasset, så spillernes navne ikke længere gemmer sig bag den.
- ⏳ **Længere opladning**: man kan holde inde i op til ca. 3,5 sekunder, og flasken snurrer 3–7 omgange i 2,4–4,8 sekunder.
- ⚖️ **Præcis lige stor chance**: spilleren vælges med `crypto.getRandomValues`, og flaskens slutvinkel styres derefter til den valgte spillers felt. Fordelingen er dermed 1/n uanset hvor mange der spiller.

### Tilføjet
- 🔍 Kvalitetskontrollen tjekker nu også **sprog og grammatik** via LanguageTool (dansk) med `node tools/kvalitet.js --sprog`. Fundene skrives i kvalitetsrapporten; egennavne markeres ofte fejlagtigt og skal vurderes manuelt.

## 0.2.18 – 2026-11-14

### Rettet
- 🍾 **Flaskehalsen drejer nu rigtigt**: flasken animeres på det eksisterende element (CSS-transition) i stedet for at blive genoptegnet, så man ser den snurre i 2–4 sekunder og lande på en spiller. Grafikken er samtidig løftet: SVG-flaske med gradient og lys, cirkelring og større spillerkort, der ikke længere skjules bag flasken.

## 0.2.17 – 2026-11-14

### Tilføjet
- 🔍 **Kvalitetskontrol** (`tools/kvalitet.js`): gennemgår puljerne for tomme tekster, dubletter, svar der står i spørgsmålet, HTML-rester, skæve citationstegn/parenteser og tal uden for rimelige grænser. Rapporten ligger i [docs/kvalitetsrapport.md](docs/kvalitetsrapport.md) og laves på ny i CI ved hver ændring. Se [docs/kvalitet.md](docs/kvalitet.md).

## 0.2.16 – 2026-11-14

### Rettet
- 🔊 **Oplæsning i Home Assistant-appen**: appens WebView giver ikke spillet adgang til telefonens tale, også selv om dansk tekst-til-tale er installeret. Spillet opdager det nu og tilbyder **«Åbn i Chrome»** (hvor oplæsningen virker) samt Home Assistant-højttaleren. Der ventes også længere på Androids stemmeliste.

## 0.2.15 – 2026-11-14

### Tilføjet
- 🍾 **Flaskehalsen peger på** – hold knappen inde for at lade op, slip, og flasken snurrer og lander på en spiller. Resten foregår i virkeligheden.
- 🎯 **S · P · K** – tre store bogstaver, hvor ét vælges tilfældigt med lige stor chance: S = Sandhed, P = Procent, K = Konsekvens.
- 📺 **Dansk reality** – 29 spørgsmål om offentligt kendte vindere af Paradise Hotel, X Factor og Vild med dans. Kilder: [docs/kilder-reality.md](docs/kilder-reality.md).

## 0.2.14 – 2026-11-14

### Ændret
- 🔒 **Alle spørgsmålspuljer er krypterede**: de ligger ikke længere som læsbar tekst i repositoryet, men som base64-blobs, der først dekrypteres, når spillet starter (`www/hs-krypto.js`). Det gør det ikke trivielt at læse svarene fra GitHub eller «vis kilde», og besværligt at kopiere puljen til en anden app.
- Værktøj: `node tools/krypt.js laas|laas-op|--tjek`. Nattens job og kildetjekket krypterer automatisk `ex_daily.js` og `vf2.js` efter skrivning, og CI afviser en udgivelse, hvis en pulje ikke kan dekrypteres.
- **Forbehold:** nøglen skal ligge i browseren, så en besluttet person kan stadig trække den ud. Det er anti-snyd i praksis, ikke kryptografisk hemmeligholdelse.

## 0.2.13 – 2026-11-14

### Ændret
- 🏛️ **Græker eller sygdom er gjort sværere**: de mest åbenlyse navne (Sokrates, Platon, Zeus, Athene …) er ude, bi-navne som «fra Elea» er fjernet, og der er kommet mange mere ukendte filosoffer, læger, astronomer og digtere ind. Sygdomsnavnene står på latin uden «Morbus»-præfiks (fx «Addison», «Scorobutus» → «Scorbutus», «Osteoporosis»). Puljen er på 111 ord.
- 🔊 **«Opsæt stemme»-knap** i indstillingsboksen: viser de præcise trin for Android/iOS/Windows/macOS, og på Android kan knappen åbne telefonens taleindstillinger direkte. Bruges når enheden mangler en dansk stemme.

## 0.2.12 – 2026-11-14

### Ændret
- 🏛️ **Græker eller sygdom** bruger nu **latinske sygdomsnavne** i stedet for de danske (fx «Osteoporosis» og «Scorbutus» frem for «Knogleskørhed» og «Skørbug»), så ordene lyder lige så fremmede som grækernavnene. Puljen er på 108 ord (58 grækere/guder + 50 sygdomme). Hvert sygdomsnavn er slået op på engelsk og ført videre til den danske artikel via sproglink, hvor begge beskriver en sygdom; kilderne er opdateret i [docs/kilder-graeker-sygdom.md](docs/kilder-graeker-sygdom.md).

## 0.2.11 – 2026-11-14

### Tilføjet
- 🏛️ **Græker eller sygdom** – 107 ord, hvor man gætter, om det er en græsk person/gud eller en sygdom (fx «Platon» og «Psoriasis»). Hvert ord er kontrolleret i dansk og engelsk Wikipedia; kilderne står i [docs/kilder-graeker-sygdom.md](docs/kilder-graeker-sygdom.md).
- ⚽ **Dansk fodbold** – 44 spørgsmål om Superligaen og danske klubbers stiftelsesår.
- 🌍 **International fodbold** – 71 spørgsmål om VM, EM og Champions League. Kilder: [docs/kilder-fodbold.md](docs/kilder-fodbold.md).

### Rettet
- **Intet indhold stikker længere ud over skærmen**: lange ord og kodebrikker ombrydes, glyf-rækkerne i kodespillene wrapper og skaleres efter skærmbredden, og billeder/SVG'er holdes inden for kortet.

## 0.2.10 – 2026-11-14

### Ændret
- 🌉 **Glasbroen viser tydeligt, når en spiller falder**: en cirkel i spillerens farve falder ned gennem broen, broen ryster, og der står stort «💥 <navn> faldt!» efterfulgt af «▶ Nu går turen videre til <næste>» i den næste spillers farve. Knapperne er låst, mens animationen kører, så man ikke kommer til at trykke for den forrige spiller.

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
