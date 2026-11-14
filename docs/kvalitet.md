# Kvalitetskontrol af spørgsmål og svar

Hyggespil har to lag kontrol oven på hinanden:

1. **Kildetjek** (natjobbet): hvert faktapunkt skal kunne dokumenteres med mindst to uafhængige
   domæner og ordrette citater (love: selve lovteksten + to). Punkter, der ikke kan dokumenteres,
   fjernes.
2. **Kvalitetskontrol** (`tools/kvalitet.js`): ser på selve teksten, uanset kilder.

## Hvad kvalitetskontrollen finder

| Regel | Betydning |
|---|---|
| `tom` | Spørgsmålet/svaret er tomt eller under 8 tegn |
| `dublet` | Samme spørgsmål findes to gange i puljen |
| `lækage` | Svaret står ordret i spørgsmålet (gør det for let) |
| `html` | Der er HTML-rester i teksten |
| `pladsholder` | `???`, `�` eller andre pladsholdere |
| `dobbelt-mellemrum`, `løse-mellemrum` | Formatering |
| `lille-begyndelse` | Spørgsmålet begynder med lille bogstav |
| `skæve-citater`, `skæve-parenteser` | Ubalancerede tegn |
| `tal-ude-af-range` | Numerisk svar er negativt, uendeligt eller absurd stort |

Rapporten skrives til [`kvalitetsrapport.md`](kvalitetsrapport.md) og laves på ny af CI ved hver
ændring (`node tools/kvalitet.js`).

## Sådan bruges den

```bash
node tools/kvalitet.js          # skriv rapport
node tools/kvalitet.js --fejl   # returnér fejlkode ved alvorlige fejl
```

Filerne er krypterede, så værktøjet dekrypterer dem i hukommelsen – det skriver aldrig klartekst til
disken.

## Hvad der stadig er manuelt

Automatikken fjerner ikke indhold af sig selv. Et spørgsmål kan være grammatisk korrekt og stadig
være dårligt (tvetydigt, for nemt, forkert aldersgruppe), og derfor skal rapporten læses igennem.
Næste skridt er at lade natjobbet foreslå rettelser til de poster, rapporten markerer, og først
fjerne dem efter en menneskelig godkendelse.
