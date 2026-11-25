# 🃏 Hygge Games

Danske selskabsspil til Home Assistant: quiz, gåder, lege og udfordringer til én fælles skærm – tablet, tv eller telefon.
Spillet kører lokalt i din Home Assistant og bruger ingen konto, sky eller eksterne tjenester.

**Hygge** er den danske tradition for at være sammen i et roligt tempo – uden præstationspres, med tid til hinanden, noget godt at spise og plads til at grine. Det handler ikke om at vinde, men om at være sammen.

**Hygge Games** er bygget op om netop det: én skærm, alle kan være med, og samværet er vigtigere end pointene.

*Hygge is the Danish tradition of being together at an easy pace – with no pressure to perform, time for each other, something good to eat and room to laugh. Hygge Games is built around exactly that: one screen, everyone can join in, and the time together matters more than the score.*

**Udvikler:** Allan Persson · **Licens:** MIT <!-- version:start -->· **Version:** 0.2.87<!-- version:end -->

**Hentet fra GitHub:** <!-- downloads:start -->483<!-- downloads:end --> gange

![Forsiden med spiloversigten](docs/forside.jpg)

## Indhold

<!-- tal:start -->99 spil og 18.192 spørgsmål, opgaver og kort<!-- tal:end --> på dansk:

| Gruppe | Spil |
|---|---|
| Gæt & quiz | Fugl, fisk eller midtimellem · Tættest på · Sandt eller falsk · Find løgnen · Hvad skete først? · Skøre rekorder · Ordsprog · Lykkehjulet · Danske love & regler · Græker eller sygdom · Dansk fodbold · International fodbold · Dansk reality |
| Mysterie & hjernevrid | Hvem gjorde det? · Gåder · Hvem/hvad er jeg? |
| Party & leg | Forbudte ord · Gæt og vis · Hellere end · Mest sandsynlig til… · Jeg har aldrig… · Vinudfordringer · Stormester · Flaskehalsen peger på · S · P · K · Hangman · Gæt og grimasser |
| Hygge & dybde | Dybe samtaler |
| Geografi & ord | I hvilket land ligger byen? · Sæt knappenålen (3D-globus) · Postnummer-quiz · Mærkelige ord · Hvilket sprog? · Destination: hvor er vi? |
| 🚦 Færdselsloven | Bil · Cykel · Fodgænger · Alle trafikanter |
| 🌍 Spil fra hele verden | Shiritori · Yut Nori · Suit Jawa · Shagai · Inuit-vinterlege · Lotería |
| 🦑 Squid Games | Rødt lys, grønt lys · Glasbroen · Kugler: lige eller ulige · Dalgona-udfordringer · Dystre valg · Hvem i familien? |
| 🧒 Børn & unge | Hvilket dyr er jeg? · Gør som dyret · Børnegåder · Børnequiz · Gæt og vis · Ord og rim · Hvad ville du helst? · Sandt eller falsk · Hvad hører ikke til? · Tæl og gæt · Mest sandsynlig |
| 🔐 Kodespil | Zodiac-glyfer · Gridskrift · Punktskrift · Farver · Morse · Cæsars brev · Spejlbrev · Bogstavkæde |
| 🔤 Ordspil | Ord af bogstaver · Ordkæde · Ordtrappe · Ordsplit · Baglæns · Rim · Længste ord · Stavboks · Staveling |
| 🧮 Tal & matematik | Tænk et tal · Hovedregning · Talrækker · Overslag · Procent · Sanseprøve · Ur & tid · Bogstavværdi |
| 🎄 Jul | Julequiz · Julekalender-quiz · Julesange · Julefilm · Julesjov |
| 🎮 Gaming | Gamingquiz · Konsol-quiz · Hvilket spil? · Gaming-historie · Gaminglege |
| 🎲 Random | Alt i ét · Random børnespil |
| 🎵 Musikquiz | 60'erne · 70'erne · 80'erne · 90'erne · 00'erne · 10'erne · Kun dansk · MGP · Børne-MGP |
| 🎬 Filmquiz | 80'erne · 90'erne · 00'erne · 10'erne · Dansk film · Harry Potter · K-pop Demon Hunters · Disney · Hvem spillede rollen? |
| 📺 Serier | Seriequiz |
| 🔞 Kun for voksne | Romantik · Sexy udfordringer · Grænseløs · Intime spørgsmål · Jeg har aldrig 🔞 · Random 🔞 |

**Nye spil:** vises som **«Kommer snart»**, indtil puljen har over 50 spørgsmål. Det gælder som standard for nye spil.

**Aldersgrænser:** «Dystre valg» og «Hvem i familien?» er **18+**. De vises automatisk, når alle spillere i Spillere er 18 eller ældre — og skjules, hvis blot én er under. Er der ingen alder angivet, regnes spilleren som voksen.

**Music Assistant:** «Hør og gæt» (under Musikquiz) afspiller et uddrag af en sang og lader jer gætte
kunstneren. Det kræver, at **Music Assistant** er installeret i Home Assistant, og at der er valgt en
højttaler under ⚙ → Music Assistant. Uden det viser spillet en forklaring i stedet for at starte.

Desuden: point og stilling, grupper med løbende stilling fra aften til aften, og mulighed for at fortsætte et afbrudt spil.

![Et spil i gang – 💬 øverst til højre er feedback-knappen](docs/spil.jpg)

### ⏱️ Timer, hurtige svar og spænding i lyset

Boksen med indstillinger åbner **første gang, du starter et spil** – derefter huskes valgene, og du
åbner dem igen med **⚙** i spillets bjælke:

- **Hvad skal indstillingerne gælde for?** – vælg **Kun «spillets navn»** eller **Alle spil**. Et
  spil kan altså have sin egen tid og musik, mens resten følger de fælles valg. Vælger du «Alle spil»,
  fjernes spillets egen opsætning.

- **Tid pr. spørgsmål** – ingen, 30, 45, 60, 90, 120 sekunder eller din egen tid. Nedtællingen vises
  nederst til højre med en ring, der skifter fra blå til gul til rød; ved udløb bipper den og blinker.
  Den bruges ikke i bræt-, terning- og 3D-spillene, hvor en tid pr. spørgsmål ikke giver mening.
- **Ekstra point for hurtigt svar** – 0-3 point, hvis svaret kommer inden for det valgte antal sekunder
  (standard 10). Pointene gives én gang pr. spiller pr. spørgsmål.
- **Spændingsmusik** – **standard er «Ur der tikker» de sidste 20 sekunder**. Vælg mellem **12 indbyggede
  drama- og quizlyde** (dyb spænding, fare på vej, ur der tikker, langsomt ur, hjerteslag, krigstrommer,
  drama-sting, filmisk whoosh, forkert svar, sejr, fanfare og «tid er gået»), din egen lydfil (maks. 8 MB)
  eller **Ingen musik**. Lyden spiller de sidste sekunder af nedtællingen (antallet kan ændres), og
  **🎵/🔇** i spillets bjælke slår den til og fra midt i spillet. Mens der læses op, dæmpes musikken –
  den fortsætter altså, men man kan høre spørgsmålet. Se [docs/lyd.md](docs/lyd.md) (inkl. kreditering
  og licenser).
- **Oplæsning** – som standard læses spørgsmålet op med **den enhed, du spiller på** (telefon, tablet
  eller tv). I **Home Assistant-appen** findes browserens stemme ikke; vælg derfor telefonens
  Companion-app under **📱 Læs op på telefonen** – så taler telefonen selv, mens lys-automationen
  kører videre. Vil du hellere bruge en Home Assistant-højttaler, vælger du en TTS-stemme og en
  højttaler under «Læs op via en Home Assistant-højttaler i stedet». **🔊** i spillets bjælke læser
  igen. Se [docs/oplaesning.md](docs/oplaesning.md).

Valgene huskes til næste gang.

**Lyd og lys på samme tid:** musik, bip og oplæsning afspilles på den enhed, spillet kører på, og
lyset styres helt separat af `sensor.hyggespil_spil` i Home Assistant. De to kan derfor bruges
samtidig – automatiseringen hører hverken musikken eller oplæsningen.

### 📱 Android-app

Der findes også en **Android-app** til selvinstallation: [allanpersson/hyggespil-android](https://github.com/allanpersson/hyggespil-android/releases/latest).
Den indeholder spillets filer og virker uden Home Assistant; Home Assistant-funktioner (lys, fælles rum, sensor) kræver panelet.

#### 🧠 Ekspertspørgsmål

Hver pulje skal have **mindst 5 spørgsmål på Mensa/Einstein-niveau** til de skarpeste børn og voksne.
De markeres med `niveau: "ekspert"` (eller `"ekspert"` som femte led i fler-svars-opgaver), så de kan
vælges og tælles særskilt. `docs/ekspertstatus.json` viser, hvor mange hver pulje har, og hvilke der
mangler. Nattens `ekspert`-job udfylder hullerne med kildekontrollerede spørgsmål.

#### Spil sammen fra hver telefon

Én telefon (eller tablet/tv) er **tavlen**, hvor spillet kører. De andre telefoner kan byde ind:

1. Tryk **📱** i spillets hoved → **Nyt rum**. Værten får en firdelt kode, fx `4821`.
2. De andre åbner Hyggespil på deres egen telefon, trykker **📱 → Deltag**, skriver koden og deres navn.
3. Deres telefon viser nu en stor **«JEG VED DET!»**-knap. Når nogen trykker, viser tavlen
   rækkefølgen (1, 2, 3 …) og bipper, så I kan give point til den, der var først.
4. **Ryd listen** mellem spørgsmålene.

Alt går gennem Home Assistants egen forbindelse – ingen ekstern server, ingen konto. Rummet ligger i
`sensor.hyggespil_spil` som attributterne `rum`, `rum_aktiv` og `rum_buzzere`, så det kan bruges i
egne automatiseringer. Tjenesten `hyggespil.rum` kan også kaldes manuelt (`opret`, `deltag`, `forlad`,
`buzz`, `ryd`, `luk`, `start`, `svar`, `naeste`, `afslut`).

**Fælles quiz med egen skærm (beta):** værten vælger en pulje og trykker **Start runde**. Så får alle
deltagere spørgsmålet på deres egen telefon, og turen går på omgang:

- Kun den spiller, hvis tur det er, kan trykke på et svar – de andre ser «Det er X's tur».
- Det rigtige svar ligger **kun på serveren**, indtil runden afsløres, så ingen kan snyde ved at kigge
  i sensoren.
- Pointene står på alles skærme, og værten trykker **Næste spørgsmål**. Hver telefon husker, hvilken
  spiller den er, så spørgsmål og point altid lander det rigtige sted.

#### Sensor og automationer

Integrationen opretter **`sensor.hyggespil_spil`** (`klar` / `spiller` / `slut`) med attributterne
`spil`, `spil_navn`, `spillere`, `sekunder`, `tid`, `urgency` (0 → 1), `puls` (0 → 1), `musik` og
`opdateret`. Den opdateres cirka én gang i sekundet, mens der spilles, og der sendes også hændelsen
`hyggespil_spil_status`. Tjenesten `hyggespil.status` kan kaldes manuelt fra Udviklerværktøjer.

**Blueprint** «Hyggespil – spænding i lyset» får lyset til at pulsere som et hjertebank: både
hastigheden og forskellen mellem svag og kraftig lysstyrke stiger, jo tættere på udløb man er.
Importér det under **Indstillinger → Automatiseringer og scener → Blueprints → Importér blueprint**:

```
https://github.com/allanpersson/hyggespil/blob/main/blueprints/automation/hyggespil/spaending.yaml
```

Eksempel på egen automation (lysstyrke styret af pulsslaget):

```yaml
triggers:
  - trigger: state
    entity_id: sensor.hyggespil_spil
    to: "spiller"
actions:
  - repeat:
      while:
        - condition: state
          entity_id: sensor.hyggespil_spil
          state: "spiller"
      sequence:
        - action: light.turn_on
          target:
            entity_id: light.stue
          data:
            brightness_pct: "{{ (15 + 85 * state_attr('sensor.hyggespil_spil','puls') | float(0)) | round(0) }}"
            rgb_color: [255, 60, 90]
        - delay:
            milliseconds: >-
              {{ (1000 - 800 * state_attr('sensor.hyggespil_spil','urgency') | float(0)) | round(0) }}
```

Alle detaljer, attributoversigt og flere eksempler: [docs/spaending.md](docs/spaending.md).

### Børn og alder
Skriv alder på spillerne under **👥 Spillere**. Så sker der dette:

- Hvert barn (til og med 14 år) får spørgsmål på sit eget niveau. Spiller en 8-årig mod en 4-årig, får de hver sin runde.
- Niveauet følger med: 4 rigtige af de seneste 5 svar gør spørgsmålene sværere, højst 1 rigtigt af 5 gør dem lettere.
- Børn og voksne i samme gruppe skiftes til børnerunder og voksenrunder.
- Er der en spiller under 18 år, vises 🔞 slet ikke. Voksenspil, der ikke kan tilpasses børn, ligger nederst og er nedtonet.

### 🔞-sektionen
Sektionen er skjult, til man låser den op med **en kode, man selv vælger** (4–8 cifre) første gang på hver enhed.
Der findes ingen fælles kode. Koden gemmes ikke i klartekst – kun som en kontrolsum i browseren på enheden – og kan nulstilles dér.

Bemærk: koden skjuler sektionen i spillet, men teksterne ligger i spillets filer ligesom alt andet indhold. Se [SECURITY.md](SECURITY.md).

## Installation

Kræver Home Assistant 2024.12 eller nyere.

1. Åbn **Marketplace** (i ældre versioner: **HACS**) og tilføj dette repository som brugerdefineret repository:
   `https://github.com/allanpersson/hyggespil` – type **Integration**.
2. Find **Hyggespil** og hent den nyeste version (`0.2.3` eller senere). Der er ingen prereleases –
   Marketplace viser den nyeste almindelige udgivelse.
3. Genstart Home Assistant.
4. Gå til **Indstillinger → Enheder og tjenester → Tilføj integration**, og vælg **Hyggespil**.

Herefter ligger **Hyggespil** i sidebjælken, og sensoren `sensor.hyggespil_spil` dukker op.

Ny version? Den udgives automatisk, når spillets indhold eller kode ændrer sig (dagligt om morgenen),
som en almindelig `x.x.x`-udgivelse med den zip-fil, Marketplace bruger. Du henter den samme vej igen.

Fejler downloaden hos dig (fx "no usable manifest.json"), så følg [installationsguiden for fejlfinding](docs/installation-fejl.md).

**Uden Marketplace/HACS:** hent `hyggespil.zip` fra den [nyeste udgivelse](https://github.com/allanpersson/hyggespil/releases/latest),
pak den ud i `config/custom_components/hyggespil/` (så `manifest.json` ligger direkte i mappen), genstart,
og tilføj integrationen som i trin 4.

Vil du have spillet på et dashboard, kan du bruge et websidekort med adressen `/hyggespil_files/hs.html`.

## Første gang du åbner spillet

Et velkomstvindue beder dig om at vælge din egen 🔞-kode (4–8 cifre) og viser to forudoprettede spillere
(Spiller 1 og Spiller 2) i gruppen Standard. Du kan ændre navne, aldre og antal med det samme. Intet fra
udviklerens eget spil – ingen navne, point, svarede spørgsmål eller gemte spil – følger med installationen.

## Privatliv

- Spillernavne, aldre, point, grupper og egne spørgsmål gemmes kun i browseren på den enhed, I spiller på. Der er ingen konto og ingen server ud over din egen Home Assistant.
- Spændingsmusik gemmes også kun på enheden (i browserens IndexedDB) og uploades ikke.
- Spillets tilstand (spil, sekunder, puls) sendes kun til din egen Home Assistant via tjenesten `hyggespil.status` – aldrig ud af huset.
- Spillet henter intet fra internettet: ingen skrifttyper, statistik eller reklamer.
- Spillets filer ligger på `/hyggespil_files/` i din Home Assistant og kan – ligesom filer i `/local/` – læses uden login af dem, der kan nå din Home Assistant. Filerne indeholder kun selve spillet, ingen oplysninger om jer.

Mere i [SECURITY.md](SECURITY.md).

## Feedback

Hvert spil har en **💬-knap**. Skriv, hvad der er galt eller kunne blive bedre, og tryk **Åbn sag på GitHub**: så åbnes en færdigudfyldt sag i dette repository, som du selv sender (kræver en GitHub-konto). Du kan også kopiere teksten.

Spillet sender aldrig noget af sig selv. Sagen indeholder din tekst, spillets navn og – hvis du lader fluebenet stå – version, browser og antal spillere. Aldrig navne, aldre eller point.

## Kilder og fakta

Faktaspørgsmål (tal, rekorder, geografi, sprog, love og færdselsregler) er kontrolleret mod skriftlige kilder: mindst to uafhængige kilder pr. punkt, og for love selve lovteksten. Fejl kan stadig forekomme, og love ændres. Mener du, et svar er forkert, så brug 💬 i spillet og skriv gerne kilden.

Kvaliteten holdes også under lup automatisk: `tools/kvalitet.js` gennemgår puljerne for tomme tekster, dubletter, svar der står i spørgsmålet, skæve citationstegn, HTML-rester og tal uden for rimelige grænser — og kan med `--sprog` køre teksten gennem LanguageTool for stave- og grammatikfejl. Rapporten ligger i [docs/kvalitetsrapport.md](docs/kvalitetsrapport.md), og CI laver en ny ved hver ændring.

## Kendte begrænsninger

- Afprøvet i Chromium på pc. Telefon, tablet og Home Assistant-appen er ikke gennemtestet.
- Den automatiske sværhedsgrad gælder kun børn; voksenspørgsmålene har ingen sværhedsgrader.
- Der er færrest børnespørgsmål til 3–5 år og 11–13 år.
- Alle spiller på samme skærm; der er ingen synkronisering mellem enheder.
- Spillet findes kun på dansk.
- Sensoren og blueprintet er testet som kode og YAML, men ikke i en kørende Home Assistant endnu.
  Musikafspilning kræver, at browseren har fået et klik (det gør «Start spil»).
- Oplæsning bruger de stemmer, enheden har. Mangler der en dansk stemme, bliver udtalen derefter.

## ☕ Støt projektet

Hyggespil er gratis og uden reklamer. Er det blevet en fast del af jeres spilleaftener, kan du give
en kop kaffe:

<p><a href="https://buymeacoffee.com/i8B3Mn5"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" width="217"></a></p>

## Nyheder

<!-- nyheder:start -->
### 0.2.87 – 2026-11-25

**Tilføjet**
- **Nyt navn: Hygge Games** – med en dansk og engelsk forklaring af, hvad hygge er, og hvordan spillet er bygget op om at være sammen.
- **Engelsk**: menuer, spilnavne og 12 spil med engelsk indhold (122 kort). Dansk-specifikke kategorier som postnummer, færdselsloven og dansk reality vises ikke på engelsk. Skift sprog med **DA/EN** øverst.
- **Solo**: ét spiller kan nu spille alle de spil, hvor en modstander ikke er nødvendig – quiz, gåder, ordspil, tal, koder og mere.
- **Tysk og fransk** er forberedt i sprogarkitekturen og dokumenteret i `docs/SPROG.md`.
- **Installationsguide**: `docs/INSTALL.md` viser, hvordan man undgår Play Protect-scanning ved hver installation (Play intern test, ADB eller Obtainium).
**Rettet**
- Puljer tælles nu pr. sprog (`da`/`en`), så dansk og engelsk udvides og måles hver for sig.
- Hygge Games, engelsk og solo

### 0.2.86 – 2026-11-25

**Tilføjet**
- **2 nye spørgsmål og kort** fordelt på: zip (2).
- Nye spørgsmål: 2

### 0.2.85 – 2026-11-25

**Tilføjet**
- **207 nye spørgsmål og kort** fordelt på: mus70 (20), Love & regler (19), Dalgona (10), Stormester (10), cifcol (10), cifmors (10), cifked (10), ordkaede (10), ordsplit (10), omvendt (10), langst (10), Græker eller sygdom (10), mgp (10), musma (10), film00 (10), roller (10), julesjov (10), spilnavn (10), ordlav (8).
- Nye spørgsmål: 207

### 0.2.84 – 2026-11-24

**Tilføjet**
- **221 nye spørgsmål og kort** fordelt på: ftl_bil (24), bmgp (20), Destination (10), cifsym (10), cifvine (10), cifcaes (10), cifspjl (10), ordtrappe (10), stavboks (10), staveling (10), International fodbold (10), mus90 (10), musdk (10), film80 (10), film90 (10), harry (10), gamingquiz (10), ftl_fod (10), mus80 (9), cifbrl (8).
- Nye spørgsmål: 221

### 0.2.83 – 2026-11-24

- Nye spørgsmål: 246

### 0.2.82 – 2026-11-24

**Tilføjet**
- **246 nye spørgsmål og kort** fordelt på: julequiz (20), julesange (20), gaminghistorie (18), julekalender (12), Dalgona (10), Dystre valg (10), Hvem i familien? (10), Stormester (10), omvendt (10), rim (10), Dansk reality (10), mus00 (10), film10 (10), filmdk (10), serier (10), roller (10), julesjov (10), spilnavn (10), gamingleg (10), ftl_andre (10), cifmors (8), ordsplit (8).
- Nye spørgsmål: 236

### 0.2.81 – 2026-11-24

**Tilføjet**
- **247 nye spørgsmål og kort** fordelt på: Dansk fodbold (20), mus10 (20), disney (20), julefilm (20), cult (20), Dystre valg (10), Destination (10), cifvine (10), cifcol (10), cifked (10), ordkaede (10), langst (10), stavboks (10), staveling (10), mgp (10), musma (10), film00 (10), julekalender (10), musdk (9), cifbrl (8).
- Nye spørgsmål: 247

### 0.2.80 – 2026-11-24

**Tilføjet**
- **211 nye spørgsmål og kort** fordelt på: mus60 (18), ftl_cykel (18), Hvem i familien? (10), cifsym (10), cifcaes (10), cifspjl (10), ordtrappe (10), rim (10), Dansk reality (10), mus80 (10), mus90 (10), mus00 (10), bmgp (10), film90 (10), harry (10), gamingquiz (10), ftl_bil (10), julesange (9), film80 (8), julequiz (8).
- Nye spørgsmål: 211
- Gaming som ét samlet spil

Ældre versioner (beta) og hele historikken: [CHANGELOG.md](CHANGELOG.md) · [alle udgivelser](https://github.com/allanpersson/hyggespil/releases)
<!-- nyheder:end -->

## 🔒 Krypterede spørgsmålspuljer

Spørgsmål, svar og forklaringer ligger **ikke som læsbar tekst** i repositoryet eller i `www/`.
Hver puljefil er en base64-blob, der først dekrypteres, når spillet starter i browseren
(`www/hs-krypto.js`), og først derefter lægges ind i `DATA`. Det gør det ikke trivielt at snuse
svarene op fra GitHub eller fra «vis kilde» i browseren, og det gør det besværligt at kopiere hele
puljen ind i en anden app.

**Vær opmærksom på:** nøglen skal ligge i browseren, for at spillet kan køre uden en server. En
besluttet person kan derfor stadig trække nøglen ud og dekryptere indholdet. Det her er **anti-snyd
og kopibeskyttelse i praksis**, ikke kryptografisk hemmeligholdelse.

Kilder og forklaringer kan stadig læses i [`docs/`](docs/) — fx
[kilder til fodboldquizzerne](docs/kilder-fodbold.md) og
[kilder til græker/sygdom](docs/kilder-graeker-sygdom.md).

Værktøj til vedligeholdelse: `node tools/krypt.js laas` (krypter), `laas-op` (dekrypter til
`hyggespil-tools/klart/` til redigering) og `--tjek` (CI-kontrol af at alt kan dekrypteres).

## Udvikling

### Udgivelser og ændringslog

Udgivelser laves af CI, når spillets filer ændrer sig. For at få de rigtige noter med **i selve
udgivelsen** (i stedet for bagefter) skrives de i [`docs/udgivelsesnoter.md`](docs/udgivelsesnoter.md),
inden ændringen pushes. CI bruger dem som afsnit i `CHANGELOG.md`, i README og som udgivelsesnote på
GitHub og tømmer derefter filen. Er filen tom, bruges commit-beskederne.

Se [CONTRIBUTING.md](CONTRIBUTING.md). Tredjepartsindhold: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
