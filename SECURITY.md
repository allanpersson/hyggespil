# Privatliv og sikkerhed

## Hvad spillet gemmer

Alt gemmes i browserens lokale lager (`localStorage`) på den enhed, der spilles på. Intet sendes til udvikleren eller andre.

| Oplysning | Forlader enheden? |
|---|---|
| Spillernavne, aldre, farver, point | Nej |
| Grupper, løbende stilling, afbrudte spil | Nej |
| Egne spørgsmål, tilføjet under «➕ Spørgsmål» | Nej |
| Barnets automatiske niveau | Nej |
| 🔞-koden (kun som saltet SHA-256-kontrolsum) | Nej |
| Feedback-tekst og fejllog | Kun hvis du selv trykker «Åbn sag på GitHub» eller kopierer teksten |

Spillet henter ingen eksterne ressourcer og har ingen statistik eller sporing.

## Hvad integrationen gør i Home Assistant

- Serverer spillets filer fra `custom_components/hyggespil/www/` på adressen `/hyggespil_files/`.
- Tilføjer et panel i sidebjælken.

Den læser ingen enheder, entiteter eller indstillinger og skriver ikke i din konfiguration.
Filerne på `/hyggespil_files/` kan, ligesom filer i `/local/`, hentes uden login af dem, der kan nå din Home Assistant. De indeholder kun selve spillet.

## 🔞-låsen – hvad den er, og hvad den ikke er

Koden vælger du selv på hver enhed, og der findes ingen fælles kode. Låsen skjuler sektionen i spillet, så den ikke åbnes ved en fejl.

Den er **ikke** en teknisk beskyttelse: voksenteksterne ligger i spillets filer (`p8.js`, `p9.js`, `q9.js`, `qa.js`, `extra.json`) og kan læses af den, der åbner filerne direkte, og koden kan nulstilles på enheden. Vil du ikke have indholdet i huset, kan du slette puljerne `xr`, `xs`, `xh`, `xq` og `xn` i de filer.

Når en spiller har en alder under 18 år, vises 🔞-knappen ikke.

## Feedback via GitHub

Sager på GitHub er offentlige. Skriv derfor ikke navne, adresser eller andre personlige oplysninger i feedback.

## Meld et problem

Sikkerheds- eller privatlivsproblemer meldes fortroligt via **Security → Report a vulnerability** i dette repository – ikke som en åben sag.

## Android-appen (Play og sideload)

Appen er en tynd WebView omkring de samme filer som Home Assistant-udgaven. Den er hærdet sådan:

| Indstilling | Værdi | Hvorfor |
|---|---|---|
| Netværkstilladelse | **Ingen** | alt ligger i appen; eksterne links åbnes i browseren |
| `allowBackup` | `false` | spillets data og aldersbekræftelsen skal ikke kopieres til skyen |
| Filadgang | `allowFileAccess=false`, `allowContentAccess=false` | WebView kan ikke læse telefonens filer |
| Mixed content | aldrig | ingen http-indhold |
| Debug | kun i debug-build | release kan ikke inspiceres via USB |
| Eksterne links | kun https til `github.com`, `buymeacoffee.com`, `allanpersson.github.io` | forhindrer videresendelse til ukendte sider |
| JavaScript-bro | kun `tal()` og `stopTale()` | TTS, intet andet |
| Play-upload-nøgle | **ikke** i repoet | sideload-nøglen er offentlig og må kun bruges til GitHub-APK |

Spillet har ingen cookies, ingen localStorage-nøgler med personoplysninger ud over spillernavne/aldre, og ingen adgang til kontakter, kamera, mikrofon eller placering.

## Aldersporten (🔞) – hvad den er, og hvad den ikke er

For at beskytte børn kræver voksensektionen:

1. En **aldersbekræftelse** (fødselsår) første gang, 🔞 åbnes. Bekræftelsen gemmes kun på enheden og følger ikke med en backup.
2. En **kode på 4–8 cifre**, som brugeren selv vælger. Koden gemmes kun som saltet SHA-256.

Det er en adgangskontrol og en alderserklæring – ikke en teknisk børnesikring. En voksen, der deler enheden med et barn, bør låse 🔞 igen efter brug, og enhedens egen brugersikring (skærmlås/børnetilstand) er det stærkeste værn. Indholdet ligger i spillets filer og kan læses af den, der har adgang til filerne.

Ønskes en helt familievenlig udgave, kan voksenafsnittet slås helt fra med `window.HSA = { udenVoksen: true }` (se `docs/PLAY.md`).
