# Bidrag til Hyggespil

Fejlrapporter og forslag er velkomne – nemmest via 💬-knappen i spillet eller under [Issues](https://github.com/allanpersson/hyggespil/issues).

## Prøv spillet uden Home Assistant

Kræver kun Node.js:

```
node tools/serve.js
```

Åbn derefter `http://127.0.0.1:8899/hs.html`.

## Sådan er repoet bygget op

```
custom_components/hyggespil/        Home Assistant-integrationen
  __init__.py, config_flow.py       serverer spillet og viser panelet
  www/                              selve spillet (ren HTML/JavaScript, intet byggetrin)
    index.html                      kernen: spillere, point, spilforløb
    ext.js                          spiltyper, 🔞-lås og listen over filer, der indlæses
    hs2.js … hs5.js                 grupper, børnespil, flere spil, alderstilpasning
    feedback.js, hs-cfg.js          feedback-knap, version
    data*.js, p*.js, q*.js, k1.js   spørgsmål og kort
tools/                              kontrol- og hjælpescripts
```

## Før du sender en pull request

```
node tools/build.js check
python tools/verify_integration.py
```

`check` kontrollerer syntaks og afviser personlige oplysninger, lokale stier og faste koder i spillets filer.
Prøv også ændringen i browseren med både voksne, børn og en blandet gruppe.

## Nyt indhold

- Skriv naturligt dansk.
- Faktaspørgsmål skal have mindst to uafhængige kilder i pull requesten (for love: selve lovteksten). Uden kilder kommer de ikke med.
- Børneindhold skal have en alder (`age` = den yngste alder, punktet passer til).
- Voksenindhold hører kun hjemme i 🔞-puljerne (`xr`, `xs`, `xh`, `xq`, `xn`).
- Ingen personlige oplysninger om rigtige mennesker.

Bidrag udgives under MIT-licensen.
