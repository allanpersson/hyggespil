# Ophavsret og varemærker

Denne gennemgang beskriver, hvordan Hyggespil undgår at krænke andres rettigheder. Den er lavet til brug ved udgivelse på Google Play og App Store og opdateres, når der kommer nye spil.

## 1. Grundprincipper

1. **Alt indhold er skrevet til Hyggespil.** Spørgsmål, opgaver, gåder og tekster er formuleret til spillet. Der er ikke kopieret spørgsmål, svar eller regeltekster fra andre spil, bøger, tv-programmer eller hjemmesider.
2. **Fakta, ikke formuleringer.** Hvor et spørgsmål bygger på en faktuel oplysning, er kilden kontrolleret og noteret (se `docs/kilder-*.md` og `hyggespil-tools/ledger.json`). Det er den faktuelle oplysning, der gengives – ikke kildens ordlyd.
3. **Spilmekanik er ikke beskyttet.** Regler og idéer (fx «gæt et ord», «sæt en nål på kortet») kan ikke ophavsretligt beskyttes. Det er den konkrete tekst, grafik og lyd, der er beskyttet – og den er egen.
4. **Ingen billeder eller lyd fra andre.** Spillet bruger enhedens emoji og skrifttyper. De eneste medfølgende filer er egne eller licenserede (se `THIRD_PARTY_NOTICES.md`).
5. **Ingen tilknytning.** Spillet hverken påstår eller antyder, at det er godkendt af, lavet af eller knyttet til rettighedshaverne bag de spil, det er inspireret af.

I appen står der under **Om spillene**:

> Alle spil i Hyggespil er inspireret af klassiske selskabsspil, gamle lege, tv- og radioprogrammer og traditioner fra hele verden. … Alt indhold her er skrevet til Hyggespil. Det er inspireret af – ikke kopieret fra – spillene, det tager afsæt i.

## 2. Navne, der er ændret af hensyn til varemærker

| Før | Nu | Grund |
|---|---|---|
| 🦑 Squid Games (gruppe) | 💀 Dødsspil | «Squid Game» er Netflix' varemærke |
| Filmquiz – Harry Potter | Filmquiz – Troldmandsfilmene | Undgår varemærket i spiltitlen; spørgsmålene handler om filmene |
| Disneyquiz | Tegnefilmsquiz | «Disney» er et varemærke |
| Filmquiz – K-pop Demon Hunters | Filmquiz – K-pop og dæmoner | Undgår filmtitlen i spiltitlen |
| Musikquiz – Børne-MGP / MGP | Musikquiz – børnenes Grand Prix / Grand Prix | «MGP» er DR's varemærke |
| Stormester | Opgavemesteren | «Stormester» er TV 2's format |
| Lykkehjulet | Ordhjulet | «Lykkehjulet» er TV 2's programtitel |

Spillets **nøgler** (`sm`, `wheel`, `harry`, `disney`, `kpop`, `bmpg` …) er uændrede, så gemte point og puljer fortsat virker.

Andre navne er almindelige danske ord eller traditionelle lege: *Fugl, fisk eller midtimellem*, *Gæt og vis*, *Jeg har aldrig*, *Sandt eller falsk*, *Hvad skete først?*, *Dalgona*, *Yut*, *Lotería*, *Shagai*. De er ikke andres varemærker i denne sammenhæng.

## 3. Hjulet i «Ordhjulet»

Hjulet er **tegnet til Hyggespil** som SVG: egne farver, egne felter og egne værdier. Der er ikke indlejret billeder, logoer eller skærmbilleder fra noget tv-program og ingen gengivelse af et bestemt programs grafiske design.

`THIRD_PARTY_NOTICES.md` nævner et Wikimedia-foto brugt som *visuel reference* til farveidéen. Billedet er **ikke** i repoet eller appen. Hvis der ønskes fuld afstandtagen, kan referencen fjernes uden at ændre spillet.

## 4. Tredjepartskomponenter og licenser

| Komponent | Licens | Krav | Opfyldt |
|---|---|---|---|
| three.js r149 | MIT | licens- og copyrighttekst med | `three.min.js` har headeren; teksten står i `THIRD_PARTY_NOTICES.md` |
| Natural Earth 1:50m | Public domain | ingen | krediteres i noterne |
| FrequencyWords (Ordjagtens ordliste) | CC BY-SA 4.0 | kreditering + samme licens for listen | `THIRD_PARTY_NOTICES.md` og **Om** |
| Lyde fra OpenGameArt | CC0 / CC-BY 3.0 / CC-BY 4.0 | kreditering ved CC-BY | `THIRD_PARTY_NOTICES.md`, `docs/lyd.md`, `lyd/CREDITS.txt` og link i **Om spillene** |
| Emoji og skrifttyper | enhedens egne | ingen | intet følger med |
| `sirene.mp3` | egen syntese (MIT) | ingen | `tools/lav_lyde.py` |

CC-BY-licenserne kræver, at krediteringen er tilgængelig for brugeren. Derfor linker **Om spillene** til den fulde liste.

## 5. Brugernes egne spørgsmål

Brugeren kan tilføje egne spørgsmål under «➕ Foreslå spørgsmål». De gemmes **kun lokalt** på enheden og sendes ikke til udvikleren. Hvis brugeren selv vælger at sende et forslag via GitHub, er det brugeren, der står bag teksten, og forslaget gennemgås før eventuel brug.

## 6. Hvis en rettighedshaver henvender sig

1. Henvendelsen besvares inden for 7 dage via GitHub.
2. Det konkrete indhold tages ud af puljen med det samme, mens sagen undersøges.
3. Hvis der er tale om en fejl, rettes formuleringen – ikke kun titlen.
4. Hændelsen noteres i `CHANGELOG.md` uden personoplysninger.

Kontakt: **Security → Report a vulnerability** eller en sag i [github.com/allanpersson/hyggespil](https://github.com/allanpersson/hyggespil).

## 7. Hvad der ikke gøres

- Der bruges ikke logoer, skrifttyper, skærmbilleder eller lydklip fra andre spil eller tv-programmer.
- Der klippes ikke citater ind fra opslagsværker; faktuelle oplysninger gengives med egne ord og kilde.
- Der bruges ikke «official», «licensed» eller kendte varemærker i appens titel eller ikon.
- Der sælges ikke adgang til indhold, der tilhører andre.

## 8. Vedligeholdelse

Ved nye spil eller puljer:

- Tjek at titlen ikke er et varemærke (søg i EUIPO/DKPTO ved tvivl).
- Skriv spørgsmålene selv, og notér kilder til faktapåstande.
- Tilføj nye tredjepartsfiler til `THIRD_PARTY_NOTICES.md`, før de committes.
- Kør `node tools/kvalitet.js` og `node tools/tjek_hemmeligheder.js`.
