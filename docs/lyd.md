# Lyde og musik

Spillet har **15 indbyggede drama- og quizlyde**, man kan vælge før spillet starter (eller med **⚙**
undervejs). Derudover kan man stadig vælge sin **egen lydfil** fra enheden.

## De 15 lyde

| Lyd | Fil | Længde | Bruges til |
|---|---|---|---|
| Dyb spænding | `spaending.mp3` | 8 s (loop) | Langsom, mørk drone under en svær runde |
| Ur der tikker | `tikken.mp3` | 4 s (loop) | Nedtælling med ur |
| Hjerteslag | `hjerte.mp3` | 4 s (loop) | Hjertet, der banker hurtigere |
| Hviskende luft | `hvisken.mp3` | 6 s (loop) | Uhyggelig, luftig baggrund |
| Rolig marimba | `marimba.mp3` | 8 s (loop) | Afslappet baggrund mellem spørgsmål |
| Xylofon-motiv | `xylofon.mp3` | 5 s (loop) | Legende mystik |
| Stigende spænding | `rister.mp3` | 4 s | Riser op til afsløringen |
| Trommehvirvel | `trommehvirvel.mp3` | 4 s | Inden svaret afsløres |
| Dyb Pauke | `boom.mp3` | 2 s | Dramatisk stød |
| Mystisk klokke | `mystik.mp3` | 6 s | Klog, uhyggelig stemning |
| Quiz-intro | `quizintro.mp3` | 3,4 s | Nyt spil / ny runde |
| Sejr | `vinder.mp3` | 3 s | Rigitgt svar eller vundet spil |
| Forkert svar | `forkert.mp3` | 1,2 s | Forkert svar |
| Nedtælling | `uret.mp3` | 5 s | Biip for hvert sekund |
| Tid er gået | `sirene.mp3` | 2,4 s | Tiden løb ud |

Lydene ligger i `custom_components/hyggespil/www/lyd/` og fylder tilsammen ca. 520 KB.

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
  Musikken stopper, men kan tændes igen med samme knap.

## Musikken dæmpes, når der læses op

Når oplæsningen taler, skrues musikken ned til ca. 14 % i stedet for at stoppe. Så kan man høre
spørgsmålet, mens stemningen fortsætter – og musikken går op igen, når sætningen er læst.
Se [docs/oplaesning.md](oplaesning.md).

## Lovlighed og ophavsret

Alle 15 lyde er **syntetiseret fra bunden** af `tools/lav_lyde.py` i dette repository (sinusbølger,
støj, filtre og klokketoner – ingen samples, ingen downloads). De er derfor vores egne værker og
udgives under samme licens som resten af projektet (**MIT**). Der er intet at kreditere, og de må
bruges frit i spillet og i private optagelser af det.

Lydene kan genskabes eller justeres:

```bash
python tools/lav_lyde.py       # skriver MP3 i www/lyd (kræver ffmpeg)
python tools/lav_lyde.py --wav # behold WAV-filerne
```

Egen musik: du vælger selv en fil på enheden. Den forlader aldrig enheden, og du er selv ansvarlig
for, at du har ret til at bruge den.
