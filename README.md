# 🃏 Hyggespil

Danske selskabsspil til Home Assistant: quiz, gåder, lege og udfordringer til én fælles skærm – tablet, tv eller telefon.
Spillet kører lokalt i din Home Assistant og bruger ingen konto, sky eller eksterne tjenester.

**Udvikler:** Allan Persson · **Licens:** MIT <!-- version:start -->· **Version:** 0.2.28<!-- version:end -->

![Forsiden med spiloversigten](docs/forside.jpg)

## Indhold

<!-- tal:start -->91 spil og 8.174 spørgsmål, opgaver og kort<!-- tal:end --> på dansk:

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
| 🎲 Random | Alt i ét · Random børnespil |
| 🔞 Kun for voksne | Romantik · Sexy udfordringer · Grænseløs · Intime spørgsmål · Jeg har aldrig 🔞 · Random 🔞 |

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
### 0.2.28 – 2026-11-15

**Ændret**
- **Nyt app-ikon:** et spillekort med et rødt hjerte og en terning erstatter rødvinsglasset – både i Home Assistants sidepanel og i integrationens brand-ikon.
- Forsiden og velkomstboksen bruger nu 🃏.

### 0.2.27 – 2026-11-15

**Rettet**
- **Lyd i Home Assistant-appen:** TTS-teksten sendes nu inde i `data`, som Companion-appen kræver – fejlen «not a valid option at 'tts_text'» er væk.
- **Hangman:** galgen og figuren tegnes streg for streg ved hvert forkert bogstav, og figuren falder om ved sidste fejl. De seks prikker er fjernet.
- **Animationer i alle spil:** grøn «Rigtigt!» ved korrekt svar, rød rysten ved forkert, 💀 ved død og ⏰ når tiden løber ud.
- **Fodboldquiz:** svarene er nu store kort i én eller to kolonner, og afsløringen viser tydelige grønne/røde kort med ✓/✗.
- **Standardlyd:** «Ur der tikker» spiller nu de sidste 20 sekunder af nedtællingen, medmindre du vælger en anden lyd.

### 0.2.26 – 2026-11-15

﻿### Rettet
- **Oplæsning på telefonen virker nu i Home Assistant-appen.** Vælg telefonens Companion-app under **⚙ → 📱 Læs op på telefonen**, så læses spørgsmålet op i telefonens egen højtaler via en TTS-notifikation. Lys-automationen kører uændret videre, fordi den kun lytter til `sensor.hyggespil_spil`.
- Har du præcis én Companion-app, vælges den automatisk, når browseren ikke kan tale.
- **README og dokumentationen** beskriver nu, hvordan lyd og lys kan bruges samtidig.

### 0.2.25 – 2026-11-15

**Rettet**
- **Indstillingerne huskes nu** og gemmes på enheden. Boksen vises kun, første gang du starter et spil – derefter åbner du den med **⚙** i spillets bjælke. Du vælger selv, om ændringerne skal gælde **kun dette spil** eller **alle spil**.
- **Oplæsning er slået til som standard** og bruger den enhed, du spiller på. Musik, bip og oplæsning kan sagtens køre samtidig med lys-automationen.
- **Al tekst er gennemgået:** ødelagte tegn og skjulte kontroltegn i puljerne er fjernet, og afkortede forklaringer er ryddet op. «Græker eller sygdom» har nu 73 rene poster.
- **Krypteringen er nu UTF-8**, så æ, ø, å og – bevares ordret i alle puljer.
- **Beskrivelsen af appen** viser de rigtige tal (91 spil og 8.174 spørgsmål) og opdateres ved hver udgivelse.

### 0.2.24 – 2026-11-15

**Tilføjet**
- 🪢 **Hangman** og 🎭 **Gæt og grimasser** – to nye spil under Party & leg.

**Ændret**
- **README** viser nu selv antallet af spil og spørgsmål (91 spil, 8.212 kort) og opdateres ved hver udgivelse.

### 0.2.23 – 2026-11-15

**Ændret**
- Forberedelse af de to nye spil – indholdet i puljerne var uændret i forhold til 0.2.22.

### 0.2.22 – 2026-11-15

**Tilføjet**
- **818 nye spørgsmål og kort** fordelt på: Ord og rim (74), Mest sandsynlig (børn) (66), Hvad ville du helst? (børn) (66), Hvad hører ikke til? (66), Sandt eller falsk (børn) (64), Hvilket dyr er jeg? (64), Gør som dyret (64), Børnegåder (64), Gæt og vis (børn) (60), Tæl og gæt (60), Børnequiz (49), Færdselsloven (20), Dalgona (11), Hvem i familien? (11), Postnummer-quiz (10), Byer (5), Sandt eller falsk (5), Tal & gæt (4), Find løgnen (4), Hvad skete først? (4), Hvem/hvad er jeg? (4), Mærkelige ord (4), Hvilket sprog? (4), Skøre rekorder (4), Love & regler (4) samt mindre tilføjelser i Hellere end, Jeg har aldrig, Mest sandsynlig, Udfordringer, Dybe samtaler, Forbudte ord, Gæt og vis, Destination, Stormester og Dystre valg.

### 0.2.21 – 2026-11-14

**Rettet**
- 🍾 **Flasken** er en rigtig SVG-flaske (kork, skuldre, krop, etiket), kan lades længere op og rammer alle spillere med præcis lige stor chance (krypto-valg).
- 🔍 **Kvalitetskontrollen** tjekker nu også sprog og grammatik via LanguageTool.

**Ændret**
- **Børnepuljerne** udvides automatisk med 20 kort pr. aldersgruppe (3–5, 6–8, 9–11, 12–14) — første runde gav 241 nye kort.

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
