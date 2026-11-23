# To apps, én spilmotor

Hyggespil findes som to selvstændige apps, der deler spillets filer, men har hver sin indpakning:

| | Home Assistant | Android (og senere iOS) |
|---|---|---|
| Hvor | HACS/Marketplace, panel i HA | Google Play / App Store / sideload |
| Filer | serveres af HA fra `custom_components/hyggespil/www/` | ligger i appens assets |
| Data | browserens lager på den enhed, der spiller | appens lokale lager |
| Netværk | kun mod brugerens egen HA | **ingen** netværkstilladelse |
| Opdatering | via HACS/HA | via butikken |
| Målgruppe | husstandens fælles skærm | telefonen i hånden |

## Fælles kerne

Alt indhold, alle spil og hele spilmekanikken ligger i `custom_components/hyggespil/www/`. Begge apps bruger **præcis samme filer** – der findes ikke en separat Android-kopi af spillene.

Det betyder:

- Nye spørgsmål, rettelser og nye spil kommer automatisk med i begge apps ved næste udgivelse.
- En fejl rettes ét sted.
- Testene (`tests/spiltest.mjs`, `tests/system.mjs`) kører mod samme filer.

## Hvad der kun findes i Home Assistant-udgaven

Disse funktioner er slået fra eller skjult i Android-appen:

| Funktion | Hvorfor |
|---|---|
| `sensor.hyggespil_spil` og hændelsen `hyggespil_spil_status` | kræver HA's tilstandsmaskine |
| Automatisk lys/spænding via blueprint | kræver HA-automatiseringer |
| Music Assistant-quizzen («Hør og gæt») | kræver HA og en MA-højttaler |
| Valg af HA-højttaler til oplæsning | Android bruger telefonens egen TTS |
| Fælles spil via `hyggespil.rum` (HA-websocket) | Android bruger i stedet det fælles rum over internettet (se nedenfor) |
| «Køb en kaffe»-link | Play-udgaven må ikke linke til køb uden for butikken |

Koden tjekker platformen ét sted:

```js
// hs-app.js (Android skriver sin egen udgave ind i assets)
window.HSA = { android: true, play: true };
```

```js
// platform.js
window.HSPLATFORM = 'android' | 'ios' | 'web';
```

Herefter bruger `spilvalg.js`, `oplaesning.js`, `musikma.js` og `rum.js` kun `HSPLATFORM`.

## Hvad der kun findes i Android-udgaven

| Funktion | Hvorfor |
|---|---|
| Telefonens TTS via `AndroidVaerktoej` | WebView'en har ingen danske stemmer |
| Play-flag (`HSPLAY`) | skjuler eksterne købslinks og viser «Støt» |
| Mulighed for at slå voksenafsnittet helt fra (`udenVoksen`) | butikkens alderskrav |

## Regler for at holde dem i takt

1. **Indhold ændres kun i den fælles www-mappe.** Aldrig i appens assets direkte (de overskrives ved næste synk).
2. **Platformsforskelle samles i `hs-app.js` og `platform.js`.** Nye HA-funktioner skal tjekke `HSPLATFORM` og have en fornuftig opførsel uden HA.
3. **Begge udgaver bygges fra samme version.** Android `versionName` kommer fra spillets `manifest.json`; CI nægter at bygge, hvis filerne mangler.
4. **Tests før udgivelse:** `tests/spiltest.mjs alle` (alle spil), `tests/system.mjs` (indstillinger, første start, aldersport, Play-tilstand) og `node tools/smoke.js`.
5. **Ingen HA-specifikke links eller tekster i Play-udgaven.** «Støt» erstatter kaffelinket, og Om-boksen linker kun til GitHub.

## Verifikationsmatrix

| Tjek | HA | Android |
|---|---|---|
| Alle spil kan startes | ✅ CI | ✅ CI (samme filer) |
| Indstillinger (⚙) åbner | ✅ systemtest | ✅ systemtest |
| Første start uden kode | ✅ systemtest | ✅ systemtest |
| Aldersport + 🔞-kode | ✅ systemtest | ✅ systemtest |
| Ingen eksterne købslinks | – | ✅ systemtest |
| TTS | browser/HA | telefonens TTS |
| Offline | HA kræver adgang til HA | ✅ helt offline |

## Næste skridt

- iOS-appen genbruger samme kerne og samme flag; se `docs/IOS.md`.
- Fælles spil på tværs af telefoner kræver en transport, der ikke er HA-specifik; det er beskrevet i `docs/IOS.md` (§ „Fælles spil på tværs af platforme“).
