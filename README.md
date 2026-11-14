# 🍷 Hyggespil

Danske selskabsspil til Home Assistant: quiz, gåder, lege og udfordringer til én fælles skærm – tablet, tv eller telefon.
Spillet kører lokalt i din Home Assistant og bruger ingen konto, sky eller eksterne tjenester.

**Udvikler:** Allan Persson · **Licens:** MIT <!-- version:start -->· **Version:** 0.2.12<!-- version:end -->

![Forsiden med spiloversigten](docs/forside.jpg)

## Indhold

83 spil og over 6.400 spørgsmål, opgaver og kort på dansk:

| Gruppe | Spil |
|---|---|
| Gæt & quiz | Fugl, fisk eller midtimellem · Tættest på · Sandt eller falsk · Find løgnen · Hvad skete først? · Skøre rekorder · Ordsprog · Lykkehjulet · Danske love & regler · Græker eller sygdom · Dansk fodbold · International fodbold |
| Mysterie & hjernevrid | Hvem gjorde det? · Gåder · Hvem/hvad er jeg? |
| Party & leg | Forbudte ord · Gæt og vis · Hellere end · Mest sandsynlig til… · Jeg har aldrig… · Vinudfordringer · Stormester |
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

Når du vælger et spil, åbner en boks **inden spillet starter** (og igen med **⚙** i spillets bjælke):

- **Tid pr. spørgsmål** – ingen, 30, 45, 60, 90, 120 sekunder eller din egen tid. Nedtællingen vises
  nederst til højre med en ring, der skifter fra blå til gul til rød; ved udløb bipper den og blinker.
  Den bruges ikke i bræt-, terning- og 3D-spillene, hvor en tid pr. spørgsmål ikke giver mening.
- **Ekstra point for hurtigt svar** – 0-3 point, hvis svaret kommer inden for det valgte antal sekunder
  (standard 10). Pointene gives én gang pr. spiller pr. spørgsmål.
- **Spændingsmusik** – vælg mellem **12 indbyggede drama- og quizlyde** (dyb spænding, fare på vej,
  ur der tikker, langsomt ur, hjerteslag, krigstrommer, drama-sting, filmisk whoosh, forkert svar,
  sejr, fanfare og «tid er gået»), din egen lydfil (maks. 8 MB) eller **Ingen musik**. Lyden spiller
  de sidste sekunder af nedtællingen, og **🎵/🔇** i spillets bjælke slår den til og fra midt i
  spillet. Mens der læses op, dæmpes musikken – den fortsætter altså, men man kan høre spørgsmålet.
  Se [docs/lyd.md](docs/lyd.md) (inkl. kreditering og licenser).
- **Oplæsning** – læs spørgsmålet højt med enhedens egen stemme, eller få det læst op gennem en
  Home Assistant-højttaler. **🔊** i spillets bjælke læser igen. Se [docs/oplaesning.md](docs/oplaesning.md).

Valgene huskes til næste gang.

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
### 0.2.12 – 2026-11-14

**Ændret**
- 🏛️ **Græker eller sygdom** bruger nu **latinske sygdomsnavne** i stedet for de danske (fx «Osteoporosis» og «Scorbutus» frem for «Knogleskørhed» og «Skørbug»), så ordene lyder lige så fremmede som grækernavnene. Puljen er på 108 ord (58 grækere/guder + 50 sygdomme). Hvert sygdomsnavn er slået op på engelsk og ført videre til den danske artikel via sproglink, hvor begge beskriver en sygdom; kilderne er opdateret i [docs/kilder-graeker-sygdom.md](docs/kilder-graeker-sygdom.md).

### 0.2.11 – 2026-11-14

**Tilføjet**
- 🏛️ **Græker eller sygdom** – 107 ord, hvor man gætter, om det er en græsk person/gud eller en sygdom (fx «Platon» og «Psoriasis»). Hvert ord er kontrolleret i dansk og engelsk Wikipedia; kilderne står i [docs/kilder-graeker-sygdom.md](docs/kilder-graeker-sygdom.md).
- ⚽ **Dansk fodbold** – 44 spørgsmål om Superligaen og danske klubbers stiftelsesår.
- 🌍 **International fodbold** – 71 spørgsmål om VM, EM og Champions League. Kilder: [docs/kilder-fodbold.md](docs/kilder-fodbold.md).

**Rettet**
- **Intet indhold stikker længere ud over skærmen**: lange ord og kodebrikker ombrydes, glyf-rækkerne i kodespillene wrapper og skaleres efter skærmbredden, og billeder/SVG'er holdes inden for kortet.

### 0.2.10 – 2026-11-14

**Ændret**
- 🌉 **Glasbroen viser tydeligt, når en spiller falder**: en cirkel i spillerens farve falder ned gennem broen, broen ryster, og der står stort «💥 <navn> faldt!» efterfulgt af «▶ Nu går turen videre til <næste>» i den næste spillers farve. Knapperne er låst, mens animationen kører, så man ikke kommer til at trykke for den forrige spiller.

### 0.2.9 – 2026-11-14

**Rettet**
- **«← Alle spil» lander nu ved det spil, du kom fra** – også når du fortryder i indstillingsboksen, før spillet er startet. Før røg man til toppen af forsiden. Der rulles til selve spillkortet (med luft over), og der prøves igen efter et øjeblik, så det også virker på mobil.

### 0.2.8 – 2026-11-14

**Ændret**
- 🎵 **Lydene er nu rigtige optagelser** fra OpenGameArt i stedet for egen syntese: dyb spændingsflade, fare på vej, ur der tikker, langsomt ur, hjerteslag, krigstrommer, drama-sting, filmisk whoosh, forkert svar, sejr og fanfare – 11 optagelser plus «tid er gået». De er trimmet og lydnormaliseret (MP3, 96 kbps, ca. −16 LUFS).
- Licenserne er CC0 og CC-BY. CC-BY-filerne er krediteret i [docs/lyd.md](docs/lyd.md), `THIRD_PARTY_NOTICES.md` og `custom_components/hyggespil/www/lyd/CREDITS.txt`, som følger med udgivelsen.

**Tilføjet**
- ☕ **Støt projektet** – Buy Me a Coffee-badge i README og i spillets feedback-fod.
- `tools/hent_lyde.py` henter, trimmer og koder lydene igen og genskaber krediteringsfilen.

### 0.2.7 – 2026-11-14

**Rettet**
- 🎡 **Lykkehjulet er bygget om efter det danske tv-hjul**: 24 felter, samme farver og værdier (inkl. FALLIT, TABT TUR og JOKER), gråt nav og kant, og tekst der står radialt og følger hjulet. Skriftstørrelsen tilpasses feltet, så intet stikker ud eller forsvinder. `KR` er fjernet, da det rodede billedet.

**Ændret**
- 🎵 **Lydene er lavet helt om og er nu meget mere dramatiske**: braam (dybe, let forvrængede strygerstakke), pauke, stryger-tremolo, bækken-svulm, riser og rumklang i stedet for tynde sinustoner. 16 lyde, ca. 0,95 MB.
- Oplæsningens to felter er nu **valglister med installationens egne enheder** (`tts.*` og `media_player.*`) i stedet for fritekst.

**Tilføjet**
- **← Alle spil** i indstillingsboksen, så man kan forlade den uden at starte et spil.

### 0.2.6 – 2026-11-14

**Tilføjet**
- 🎵 **15 indbyggede drama- og quizlyde**: dyb spænding, tikken, hjerteslag, hviskende luft, rolig marimba, xylofon-motiv, stigende spænding, trommehvirvel, Pauke, mystisk klokke, quiz-intro, sejr, forkert svar, nedtælling og «tid er gået». Vælges i indstillingerne med **Prøv lyd**; seks af dem kan loope.
- **🎵/🔇-knap** i spillets bjælke slår musikken til og fra med ét tryk – musikken kan altid fravælges, også midt i en runde.
- Lydene er **syntetiseret fra bunden** (`tools/lav_lyde.py`), så de er projektets egne (MIT) og kan bruges frit. Se [docs/lyd.md](docs/lyd.md).

**Ændret**
- Mens oplæsningen taler, **dæmpes musikken** til ca. 14 % i stedet for at stoppe, så spørgsmålet altid kan høres – og musikken går op igen bagefter.

### 0.2.5 – 2026-11-14

**Tilføjet**
- 🔊 **Oplæsning af spørgsmål** – læs spørgsmålet højt, når det vises. Vælg stemme og hastighed i indstillingerne; **🔊** i spillets bjælke læser igen, og et tryk mere stopper. Virker med enhedens egne stemmer (intet sendes ud) eller gennem en Home Assistant-højttaler via `tts.speak`. Se [docs/oplaesning.md](docs/oplaesning.md).
- Spil hvor oplæsning ville afsløre svaret (Forbudte ord, Gæt og vis, Lykkehjulet) og bræt-/3D-spillene læses ikke op.

**Ændret**
- **Udgivelsesnoterne viser nu ændringerne** direkte i Marketplace i stedet for «Se CHANGELOG.md», og udgivelserne hedder bare «Hyggespil» ved siden af versionsnummeret.
- README henter version og ændringslog automatisk og fejler i CI, hvis den kommer bagud.

Ældre versioner (beta) og hele historikken: [CHANGELOG.md](CHANGELOG.md) · [alle udgivelser](https://github.com/allanpersson/hyggespil/releases)
<!-- nyheder:end -->

## Udvikling

Se [CONTRIBUTING.md](CONTRIBUTING.md). Tredjepartsindhold: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
