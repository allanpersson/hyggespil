# Lyde og musik

Spillet har **12 indbyggede drama- og quizlyde**, man kan vælge før spillet starter (eller med **⚙**
undervejs). Derudover kan man stadig vælge sin **egen lydfil** fra enheden.

Lydene er valgt efter den stemning, man kender fra de afgørende sekunder i tv-quizzer: en dyb
spændingsflade, et ur der tikker, hjerteslag, krigstrommer og korte stød/stings.

## De 12 lyde

| Lyd | Fil | Længde | Bruges til |
|---|---|---|---|
| Dyb spænding | `spaending.mp3` | 12 s | Lang, mørk spændingsflade under en svær runde |
| Fare på vej | `fare.mp3` | 12 s | Truende, stigende baggrund |
| Ur der tikker | `tikken.mp3` | 8 s (loop) | Nedtælling |
| Langsomt ur | `langsomt-ur.mp3` | 12 s (loop) | Rolig, uhyggelig tikken |
| Hjerteslag | `hjerte.mp3` | 1,8 s (loop) | Hjertet, der banker |
| Krigstrommer | `trommer.mp3` | 12 s | Trommer, der driver spændingen op |
| Drama-sting | `sting.mp3` | 5,7 s | Stød, når svaret afsløres |
| Filmisk whoosh | `whoosh.mp3` | 3 s | Overgang mellem spørgsmål |
| Forkert svar | `forkert.mp3` | 0,5 s | Forkert svar |
| Sejr | `vinder.mp3` | 4,4 s | Rigitgt svar / vundet spil |
| Fanfare | `fanfare.mp3` | 6,1 s | Afslutning på en god runde |
| Tid er gået | `sirene.mp3` | 2,8 s | Tiden løb ud (egen syntese) |

Lydene ligger i `custom_components/hyggespil/www/lyd/` og fylder tilsammen ca. 0,92 MB.

## Sådan vælger du

1. Vælg et spil → boksen **inden spillet starter** (eller **⚙** undervejs).
2. Under **🎵 Spændingsmusik** vælger du en af lydene, **Egen fil fra enheden…** eller **Ingen musik**.
3. **Prøv lyd** afspiller den valgte lyd i fire sekunder.
4. Angiv hvor mange sekunder før udløb, lyden skal begynde (standard 10).

Musikken kræver, at der er valgt en **tid** – ellers ved spillet ikke, hvornår «de sidste sekunder»
er. Vil du have baggrundsmusik uden nedtælling, kan du tænde den manuelt med **🎵** i spillets bjælke.

## Altid muligt at slå fra

- **Ingen musik** i vælgeren.
- **🔇/🎵** i spillets bjælke slår musikken til og fra med ét tryk – også midt i en runde.

## Musikken dæmpes, når der læses op

Når oplæsningen taler, skrues musikken ned til ca. 14 % i stedet for at stoppe. Så kan man høre
spørgsmålet, mens stemningen fortsætter – og musikken går op igen, når sætningen er læst.
Se [docs/oplaesning.md](oplaesning.md).

## Kreditering og licenser

Lydene kommer fra **OpenGameArt.org** og bruges under deres respektive licenser. CC0 kræver intet;
CC-BY kræver, at ophavsperson og kilde nævnes – det sker her, i `THIRD_PARTY_NOTICES.md` og i
`custom_components/hyggespil/www/lyd/CREDITS.txt`, som følger med udgivelsen.

| Lyd | Titel | Ophav | Licens | Kilde |
|---|---|---|---|---|
| spaending | Space Impending Danger SFX (space1) | aquinn | CC0 | <https://opengameart.org/content/space-impending-danger-sfx> |
| fare | Space Impending Danger SFX (space2) | aquinn | CC0 | <https://opengameart.org/content/space-impending-danger-sfx> |
| tikken | Ticking clock | bart | CC0 | <https://opengameart.org/content/ticking-clock> |
| langsomt-ur | Slow Office Clock Tick, Seamless Looping | medicinestorm | CC-BY 4.0 | <https://opengameart.org/content/slow-clock-ticking-seamless-looping-sfx-sound-effect> |
| hjerte | Heartbeat sounds (slow, reverb) | bart | CC0 | <https://opengameart.org/content/heartbeat-sounds> |
| trommer | Horde War Drums loop | william-hector | CC0 | <https://opengameart.org/content/horde-war-drums-loop> |
| sting | Mystery Sting | railkill | CC0 | <https://opengameart.org/content/mystery-sting> |
| whoosh | "Day 1" Cinematic transition sound | copyc4t | CC-BY 3.0 | <https://opengameart.org/content/day-1-cinematic-transition-sound> |
| forkert | Wrong choice, Caught | davidw | CC-BY 3.0 | <https://opengameart.org/content/wrong-choice-caught> |
| vinder | Win sound effect | listener | CC0 | <https://opengameart.org/content/win-sound-effect> |
| fanfare | Hyper-Ultra-Fanfare | zane-little-music | CC0 | <https://opengameart.org/content/hyper-ultra-fanfare> |
| sirene | – (syntetiseret af projektet) | Hyggespil | MIT | `tools/lav_lyde.py` |

Filerne er trimmet og lydnormaliseret (MP3, 96 kbps, ca. −16 LUFS) med `tools/hent_lyde.py`, som
også kan hente dem igen og genskabe krediteringsfilen:

```bash
python tools/hent_lyde.py          # henter, trimmer og koder
python tools/hent_lyde.py --tjek   # viser planen uden at hente
```

Egen musik: du vælger selv en fil på enheden. Den forlader aldrig enheden, og du er selv ansvarlig
for, at du har ret til at bruge den.
