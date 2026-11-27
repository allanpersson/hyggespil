# Tredjepartsindhold

## Lyde fra OpenGameArt

Følgende lyde i `custom_components/hyggespil/www/lyd/` er hentet fra OpenGameArt.org og bruges
under deres licenser. CC0 kræver ingen betingelser; CC-BY kræver kreditering, som gives her, i
`docs/lyd.md` og i `custom_components/hyggespil/www/lyd/CREDITS.txt`.

| Fil | Titel | Ophav | Licens | Kilde |
|---|---|---|---|---|
| spaending.mp3, fare.mp3 | Space Impending Danger SFX | aquinn | CC0 | https://opengameart.org/content/space-impending-danger-sfx |
| tikken.mp3 | Ticking clock | bart | CC0 | https://opengameart.org/content/ticking-clock |
| langsomt-ur.mp3 | Slow Office Clock Tick, Seamless Looping | medicinestorm | CC-BY 4.0 | https://opengameart.org/content/slow-clock-ticking-seamless-looping-sfx-sound-effect |
| hjerte.mp3 | Heartbeat sounds (slow, reverb) | bart | CC0 | https://opengameart.org/content/heartbeat-sounds |
| trommer.mp3 | Horde War Drums loop | william-hector | CC0 | https://opengameart.org/content/horde-war-drums-loop |
| sting.mp3 | Mystery Sting | railkill | CC0 | https://opengameart.org/content/mystery-sting |
| whoosh.mp3 | "Day 1" Cinematic transition sound | copyc4t | CC-BY 3.0 | https://opengameart.org/content/day-1-cinematic-transition-sound |
| forkert.mp3 | Wrong choice, Caught | davidw | CC-BY 3.0 | https://opengameart.org/content/wrong-choice-caught |
| vinder.mp3 | Win sound effect | listener | CC0 | https://opengameart.org/content/win-sound-effect |
| fanfare.mp3 | Hyper-Ultra-Fanfare | zane-little-music | CC0 | https://opengameart.org/content/hyper-ultra-fanfare |

Filerne er trimmet og lydnormaliseret af `tools/hent_lyde.py`. `sirene.mp3` er projektets egen
syntese (MIT, se `tools/lav_lyde.py`).

## three.js

`custom_components/hyggespil/www/three.min.js` er three.js r149 (https://threejs.org), brugt til 3D-globussen i «Sæt knappenålen».
Licens: MIT. Filens licenshoved er bevaret.

```
The MIT License

Copyright © 2010-2023 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Kortdata

`world3d.js` (globus) og `world.js` (fladt reservekort) er forenklede udgaver af Natural Earth 1:50m (land, søer og floder).
Natural Earth er public domain: https://www.naturalearthdata.com/about/terms-of-use/
`world.js` genereres fra `world3d.js` med `tools/make_world.js`.

## Skrifttyper og billeder

Spillet bruger enhedens egne skrifttyper og emoji. Der følger ingen skrifttyper eller billeder med.

## Lykkehjulets design (reference – ikke en fil i spillet)

Spillet indeholder ingen billedefil fra fjernsynet. Til at efterligne de farvede felter er brugt
fotografiet af det oprindelige hjul, da 「Lykkehjulet» havde premiere i 1988:

- Fil: Lykkehjulet1988Round1Wheel.jpg — https://commons.wikimedia.org/wiki/File:Lykkehjulet1988Round1Wheel.jpg
- Ophavsret: Germanname1990 (Wikimedia Commons), 2008.
- Licens: CC BY-SA 3.0 — billedet er IKKE lagt ind i repoet, kun brugt som visuel reference.
- Hvis hjulets udseende ændres efter fotografien, sættes credit: «Foto: Germanname1990 / Wikimedia Commons, CC BY-SA 3.0».

## Ordjagt – filtreret ordliste

`custom_components/hyggespil/www/ordbank.js` indeholder de kuraterede niveaulister og en filtreret ordliste, som bruges til at godkende ord, spilleren selv finder i gitteret.

- Kilde: FrequencyWords af Hermit Dave – https://github.com/hermitdave/FrequencyWords
- Filer: `da_50k.txt` og `en_50k.txt` (OpenSubtitles 2018)
- Licens: CC BY-SA 4.0 – https://creativecommons.org/licenses/by-sa/4.0/
- Ændringer: Listen er filtreret til bogstaver, længde 2–14, uden stødende ord og uden ord, der allerede står i niveaulisterne. Ændringerne er delt under samme licens.
- Ordlisten ligger krypteret i repoet og bruges kun lokalt i spillet; der sendes intet.
