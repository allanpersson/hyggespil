# Sprog: dansk, engelsk og senere tysk og fransk

Hygge Games har dansk som standardsprog og engelsk som første ekstra sprog. Spillene, puljerne og tællingerne holdes adskilt pr. sprog, så hvert sprog kan udvides og måles for sig.

## Sådan virker det

| Del | Fil | Indhold |
|---|---|---|
| Sprogvalg og UI-tekster | `www/i18n.js` | `HSLANG`, `t('nøgle')`, sprogknap i headeren |
| Spillenes navne og beskrivelser | `www/i18n.js` (`GAME.en`) | engelske titler og beskrivelser pr. spil-id |
| Danske spil der skjules på andre sprog | `www/i18n.js` (`KUN_DA`) | fx postnummer, færdselsloven, dansk reality |
| Hvilke spil der har engelsk indhold | `www/i18n.js` (`EN_KAN`) | udvides, når puljerne vokser |
| Puljer pr. sprog | `www/en.js` (krypteret) | `DATA.tf_en`, `DATA.deep_en` … |
| Tælling pr. sprog | `tools/antal.js` → `docs/antal.json.sprog` | `da` og `en` hver for sig |

Sproget gemmes i `localStorage` som `hs_lang` og vælges med **DA/EN**-knappen øverst. Der findes ingen cookies og ingen server.

## Puljenavne

- Dansk: `DATA.tf`, `DATA.deep`, `DATA.num` …
- Engelsk: `DATA.tf_en`, `DATA.deep_en`, `DATA.num_en` …

`pool(key)` i `index.html` slår automatisk det rigtige suffiks op. Et spil uden engelsk pulje skjules på engelsk, indtil der er indhold nok – det er bedre end at vise dansk tekst til engelske spillere.

Kryptering: `en.js` ligger som klartekst i `hyggespil-tools/klart/` (uden for repoet) og krypteres til `www/en.js` med:

```bash
node tools/krypt.js fra-klart en.js
```

Den er med i `tools/krypt.js`-listen, så `--tjek` og CI kontrollerer den som de øvrige puljer.

## Udvidelse – altid færrest først

Hvert sprog har sine egne puljer og sin egen kø. Når engelsk skal vokse:

1. Tilføj puljen til jobkonfigurationen med suffikset `_en` (fx `tf_en`).
2. Brug en engelsk udgave af generationsprotokollen, så kilder og sprogkrav er de samme som på dansk: `PROTOCOL_GEN_EN.md` (samme regler som `PROTOCOL_GEN.md`, men på engelsk og med engelske kilder).
3. Kørslen vælger **den mindste pulje først** – på tværs af begge sprog, så en tom engelsk pulje kommer før en stor dansk.
4. `ingest.js` skriver til den pulje, jobbet angiver; `_en`-puljer blandes aldrig med de danske.
5. Efter kørslen opdaterer `tools/antal.js` både `sprog.da` og `sprog.en`, og README viser begge tal.

Indtil den engelske pipeline kører, er følgende spil med i den engelske udgave (12 spil, ca. 120 kort): Sandt eller falsk, Find løgnen, Hvad skete først?, Gåder, Hvem/hvad er jeg?, Forbudte ord, Hellere end, Mest sandsynlig, Jeg har aldrig, Dybe samtaler, Tættest på og Fugl/fisk/midt imellem.

## Tysk og fransk

Sproglisten i `i18n.js` har allerede `de` og `fr` med `klar:false`. For at åbne et nyt sprog:

1. Sæt `klar:true` og tilføj UI-teksterne i `T.de` / `T.fr`.
2. Tilføj spillets navne/beskrivelser i `GAME.de` / `GAME.fr` (kan starte som maskinoversat udkast, men skal gennemgås).
3. Opret `www/de.js` / `www/fr.js` med `DATA.*_de` / `DATA.*_fr` og krypter dem.
4. Tilføj sproget til `EN_KAN`-ækvivalenten (fx `DE_KAN`) og til `tools/antal.js`-mønstret (`_de`, `_fr`).
5. Kør den samme «mindste pulje først»-udvidelse for det nye sprog.

## Kvalitetsregler

- Alt indhold skal være skrevet til sproget – ikke maskinoversat uden gennemlæsning.
- Faktapåstande skal have mindst to uafhængige kilder, også på engelsk.
- Dansk-specifikt indhold (postnummer, færdselsloven, dansk fodbold/reality, danske ordspil) vises ikke på andre sprog.
- Hvert sprog tælles og udvides separat; en pulje på 10 engelske kort må ikke «låne» danske kort for at nå 50.
- Nye sprog må ikke ændre de danske puljer eller point.
