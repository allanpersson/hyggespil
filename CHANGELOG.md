# Ændringer

Versionerne følger [Semantic Versioning](https://semver.org/lang/da/).


## 0.2.55 – 2026-11-19

### Tilføjet
- **505 nye spørgsmål og kort** fordelt på: Gør som dyret (108), Gæt og vis (børn) (108), bmgp (34), mgp (30), musdk (29), Ord og rim (27), mus10 (27), mus80 (26), film80 (26), Hvad hører ikke til? (25), mus90 (14), mus00 (14), film90 (14), film00 (14), Tæl og gæt (9).
- Nye spørgsmål: 505

## 0.2.54 – 2026-11-19

### Tilføjet
- **2584 nye spørgsmål og kort** fordelt på: Hvilket dyr er jeg? (243), Tæl og gæt (227), Sandt eller falsk (børn) (215), Hvad hører ikke til? (215), t1reg (193), t1rak (168), Børnegåder (164), Børnequiz (159), Hvad ville du helst? (børn) (135), t1tal (128), Mest sandsynlig (børn) (109), t1est (108), t1sans (108), t1ur (108), t1bog (108), t1proc (106), Ord og rim (81), zip (9).
- Nye spørgsmål: 2584

## 0.2.53 – 2026-11-18

### Tilføjet
- **754 nye spørgsmål og kort** fordelt på: t1tal (108), t1est (108), t1sans (108), t1bog (108), t1proc (107), t1ur (107), t1reg (54), t1rak (54).
- Nye spørgsmål: 754

## 0.2.52 – 2026-11-18

### Tilføjet
- **453 nye spørgsmål og kort** fordelt på: Hvilket dyr er jeg? (91), Børnequiz (75), Hvad hører ikke til? (69), Sandt eller falsk (børn) (67), Tæl og gæt (53), Hvad ville du helst? (børn) (46), Børnegåder (44), zip (8).
- Nye spørgsmål: 453

## 0.2.51 – 2026-11-17

### Tilføjet
- **12 nye spørgsmål og kort** fordelt på: rim (12).
- Nye spørgsmål: 12

## 0.2.50 – 2026-11-17

- Vedligeholdelse og fejlretning.

## 0.2.49 – 2026-11-17

### Tilføjet
- **124 nye spørgsmål og kort** fordelt på: stavboks (26), ordlav (24), mus60 (24), mus70 (14), Hvilket sprog? (12), rim (12), langst (12).
- Nye spørgsmål: 124

## 0.2.48 – 2026-11-17

### Tilføjet
- **550 nye spørgsmål og kort** fordelt på: Tæl og gæt (100), Børnegåder (85), Børnequiz (84), Hvad hører ikke til? (67), Hvad ville du helst? (børn) (66), Sandt eller falsk (børn) (66), Hvilket dyr er jeg? (59), zip (6), Byer (5), Mærkelige ord (4), Hvilket sprog? (3), Destination (3), Hvem/hvad er jeg? (2).
- Nye spørgsmål: 550

## 0.2.47 – 2026-11-16

### Tilføjet
- **Fem julespil:** Julequiz, Julekalender-quiz, Julesange, Julefilm og Julesjov.
- **Fem gaming-spil:** Gamingquiz, Konsol-quiz, Hvilket spil?, Gaming-historie og Gaminglege.
### Ændret
- **«Kommer snart» er nu standard for nye spil:** de vises med badge og kan ikke startes, før puljen har over 50 spørgsmål. Puljerne udvides af de daglige job.
- Jule- og gamingspil

## 0.2.46 – 2026-11-16

### Tilføjet
- **382 nye spørgsmål og kort** fordelt på: Hvad hører ikke til? (69), Hvad ville du helst? (børn) (66), Sandt eller falsk (børn) (47), Hvilket dyr er jeg? (45), Tæl og gæt (44), Børnegåder (42), Børnequiz (24), Postnummer-quiz (7), Sandt eller falsk (4), Find løgnen (4), Hvem/hvad er jeg? (4), Hvad skete først? (4), Byer (4), Mærkelige ord (4), Hvilket sprog? (4), Skøre rekorder (4), Tal & gæt (3), Destination (3).
### Rettet
- **Nattens job udgiver nu selv:** efter puljekørslen køres udgivelsen automatisk, så nye spørgsmål kommer ud samme nat. README opdateres i samme commit, så versions- og taltjekket ikke fejler.
- Nattens udgivelse og CI-fix
- Nye spørgsmål: 382

## 0.2.45 – 2026-11-15

### Rettet
- **Spillet bliver i fokus:** under et spil skjules pointrækken og den store topmenu, og siden rykker selv spillets kort op i billedet, hvis det er ude af syne. Man skal ikke længere scrolle op efter fx et spin på lykkehjulet. «← Alle spil» i spillets bjælke går stadig til forsiden.
- Fokus-tilstand i spil

## 0.2.44 – 2026-11-15

### Rettet
- **Android-appen viser ikke længere Home Assistant-vejledningen ved oplæsning.** Den lokale app har sin egen TTS-bro, så den taler med det samme og springer «Åbn i Chrome»/Companion-vejledningen over. Home Assistant-appen beholder den vejledning, der gælder der.
- Android-TTS uden forkert vejledning
- Actionlint-fix
- CI: flere tests og overvaagning

## 0.2.43 – 2026-11-15

### Ændret
- **Android-appen bruger telefonens egen højtaler som standard** og viser kun de indstillinger, der giver mening på en telefon: Music Assistant, Home Assistant-højttaler og Companion-TTS er skjult, fordi de ikke kan bruges i den lokale app.
- **«Hør og gæt (Music Assistant)»** og **📱 «Spil sammen»** vises ikke i Android-appen, da begge kræver Home Assistant.
- CI bygger og linter Android-appen, kontrollerer at spillets filer ligger i APK'en, og udgiver APK + AAB.
- Android-tilpassede indstillinger
- Henvisning til Android-app
- CI-fixes til browser-test og overvaagning
- CI med kode, indhold, build, release og gameplay
- Fuldstaendig changelog

## 0.2.42 – 2026-11-15

### Tilføjet
- **Downloadtal i README:** der står nu, hvor mange gange spillet er hentet fra GitHub (summen af alle `hyggespil.zip`-downloads). Tallet opdateres automatisk ved hver udgivelse.

### Rettet
- **Oplæsning af svarmuligheder:** spørgsmålet læses fortsat højt, og nu læses også A, B, C og D op, så man ikke skal gætte på mulighederne.

## 0.2.41 – 2026-11-15

### Ændret
- **16+-knappen er fjernet.** Spil med aldersgrænse vises nu automatisk ud fra spillernes alder: «Dystre valg» og «Hvem i familien?» er hævet til **18+** og skjules, hvis blot én spiller er under 18. Mangler en alder, regnes spilleren som voksen.
### Rettet
- **Kortenes layout:** tekst, antal i puljen og badgen «Nyt spil, puljen udvides løbende» står nu under hinanden i bunden af kortet i stedet for at ligge oven på hinanden. Beskrivelsen har fået luft og kan ikke længere flyde sammen med badges.
- **Kontrast:** kortene har fået en mørk bundgradient og stærkere tekstskygge, så hvid tekst er læsbar på de lyse orange/gule flader, og «2+ spillere» har fået en mørk baggrund.
- **Ekspertjobbet** har i første runde lagt 41 nye ekspertspørgsmål ind (num, tf, odd, tl, who, rec) og fortsætter ved næste kørsel, indtil alle puljer har 5.

## 0.2.39 – 2026-11-15

### Rettet
- **Dubletter i højttaler-listerne er væk:** samme enhed blev vist flere gange, fordi flere integrationer (fx Chromecast og Google TV) eksponerer den. Listen viser nu én pr. navn, alfabetisk, og markerer utilgængelige enheder.
- **Telefonens egen højtaler** kan vælges, når den findes som `media_player` i Home Assistant (fx via Music Assistant-appen). Music Assistant kan ikke selv afspille i en browserfane, så enheden skal være oprettet som afspiller – det står nu også i hjælpeteksten.

## 0.2.38 – 2026-11-15

### Ændret
- **Kaffe-linket** peger nu altid på `buymeacoffee.com/i8B3Mn5` og står som «☕ Køb en kaffe til mig».
- **Ny disclaimer på forsiden:** «🎲 Inspireret – ikke kopieret» fortæller, at spillene tager afsæt i klassiske spils, gamle lege og tv- og radioprogrammer, at man bør købe den fysiske udgave, hvis man kan lide spillet, og at alt indhold er skrevet til Hyggespil – inspireret af, aldrig kopieret fra originalerne. Den kan fjernes permanent med ét tryk og åbnes igen via «Om spillene» nederst.

## 0.2.33 – 2026-11-15

### Ændret
- **Forsiden er blevet kortere:** de store quizzer er samlet i ét kort med en undermenu. Tryk på **Musikquiz** og vælg mellem 60’erne, 70’erne, 80’erne, 90’erne, 00’erne, 10’erne, kun dansk musik, MGP og Børne-MGP. **Filmquiz** samler årtierne, dansk film, Harry Potter og K-pop Demon Hunters på samme måde.
- Underspillene tælles ikke længere som selvstændige spil på forsiden – der er nu 93 kort i stedet for 110.
### Rettet
- Undermenuens kort viser det samlede antal i puljen og badgen «Nyt spil, puljen udvides løbende», når en af underkategorierne har under 100.

## 0.2.32 – 2026-11-15

### Tilføjet
- **Private kort i fælles spil (beta):** «Forklar ordet» (Taboo). Kun den spiller, hvis tur det er, kan åbne sit kort, og indholdet er krypteret med spillerens egen nøgle – de andre telefoner ser kun volapyk. Værten giver point og sender turen videre.
### Rettet
- **Dobbelt svar** i «Filmquiz – dansk film»: «Flickering Lights» er den engelske titel på «Blinkende Lygter», så den er erstattet med en anden dansk komedie.
- **MGP-spørgsmålet** om antal finalesange er udskiftet med et sikkert faktum (Danmarks Eurovision-sejr i 2013).
- **Spillekortenes beskrivelser røber ikke længere svar:** titler, kunstnere og navne er fjernet fra musik-, film-, serie-, Disney- og «Græker eller sygdom»-beskrivelserne.
- **Kvalitetskontrollen** fanger nu dobbelte svarmuligheder og forkert svarindeks.

## 0.2.31 – 2026-11-15

### Tilføjet
- **Fælles quiz med egen skærm til hver spiller (beta):** værten vælger en pulje og starter runden. Alle får spørgsmålet på deres egen telefon, turen går på omgang, og kun den aktive spiller kan svare – de andre ser «Det er X's tur». Det rigtige svar ligger kun på serveren, indtil runden afsløres, så ingen kan snyde. Pointene vises på alle skærme.
- Rummet husker nu også spillere, tur, point og fase, og tjenesten `hyggespil.rum` har fået `deltag`, `forlad`, `start`, `svar`, `naeste` og `afslut`.
### Rettet
- **Puljekortene viser både antallet** («8 i puljen») **og** badgen «Nyt spil, puljen udvides løbende» – de står nu under hinanden i kortets nederste hjørne.

## 0.2.30 – 2026-11-15

### Tilføjet
- **Spil sammen fra hver telefon:** tryk 📱 i spillets hoved → «Nyt rum». Værten får en firdelt kode, og de andre telefoner deltager med koden og deres navn. Deres telefon viser en stor «JEG VED DET!»-knap, og tavlen viser rækkefølgen og bipper, så I kan give point til den, der var først. «Ryd listen» mellem spørgsmålene.
- Rummet ligger i `sensor.hyggespil_spil` (`rum`, `rum_aktiv`, `rum_buzzere`) og kan styres med den nye tjeneste `hyggespil.rum`. Alt går gennem Home Assistant – ingen ekstern server.

## 0.2.29 – 2026-11-15

### Tilføjet
- **19 nye spil**: ni musikquizzer (60'erne, 70'erne, 80'erne, 90'erne, 00'erne, 10'erne, kun dansk musik, MGP og Børne-MGP), syv filmquizzer (80'erne, 90'erne, 00'erne, 10'erne, dansk film, Harry Potter og K-pop Demon Hunters), plus Disneyquiz, «Hvem spillede rollen?» og en seriequiz.
- **«Nyt spil, puljen udvides løbende»** vises nu på spillets kort, når puljen (eller en aldersgruppe) har under 100 kort.
- Spil med kun ét kort i puljen – fx Glasbroen – viser ikke længere «1 i puljen» og tælles ikke med i puljereglerne.

## 0.2.28 – 2026-11-15

### Ændret
- **Nyt app-ikon:** et spillekort med et rødt hjerte og en terning erstatter rødvinsglasset – både i Home Assistants sidepanel og i integrationens brand-ikon.
- Forsiden og velkomstboksen bruger nu 🃏.

## 0.2.27 – 2026-11-15

### Rettet
- **Lyd i Home Assistant-appen:** TTS-teksten sendes nu inde i `data`, som Companion-appen kræver – fejlen «not a valid option at 'tts_text'» er væk.
- **Hangman:** galgen og figuren tegnes streg for streg ved hvert forkert bogstav, og figuren falder om ved sidste fejl. De seks prikker er fjernet.
- **Animationer i alle spil:** grøn «Rigtigt!» ved korrekt svar, rød rysten ved forkert, 💀 ved død og ⏰ når tiden løber ud.
- **Fodboldquiz:** svarene er nu store kort i én eller to kolonner, og afsløringen viser tydelige grønne/røde kort med ✓/✗.
- **Standardlyd:** «Ur der tikker» spiller nu de sidste 20 sekunder af nedtællingen, medmindre du vælger en anden lyd.

## 0.2.26 – 2026-11-15

﻿### Rettet
- **Oplæsning på telefonen virker nu i Home Assistant-appen.** Vælg telefonens Companion-app under **⚙ → 📱 Læs op på telefonen**, så læses spørgsmålet op i telefonens egen højtaler via en TTS-notifikation. Lys-automationen kører uændret videre, fordi den kun lytter til `sensor.hyggespil_spil`.
- Har du præcis én Companion-app, vælges den automatisk, når browseren ikke kan tale.
- **README og dokumentationen** beskriver nu, hvordan lyd og lys kan bruges samtidig.

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
