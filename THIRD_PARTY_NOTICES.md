# Tredjepartsindhold

## Lyde

Alle lyde i `custom_components/hyggespil/www/lyd/` er **syntetiseret af `tools/lav_lyde.py`** i dette
repository. Der indgår ingen samples eller optagelser fra tredjepart, og lydene er derfor projektets
egne værker under MIT-licensen. Ingen kreditering nødvendig.

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
