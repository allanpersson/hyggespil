# Indtjening uden at forstyrre spillet

Hyggespil skal kunne tjene lidt penge uden at ødelægge oplevelsen. Principperne er enkle:

1. **Spillet er gratis og komplet.** Ingen niveauer, spørgsmål eller spil låses op mod betaling.
2. **Ingen reklamer.** Hverken banner, video eller «belønnet» reklame.
3. **Ingen sporing.** Ingen analyse-SDK'er, ingen profiler, ingen salg af data.
4. **Frivillig støtte.** Den eneste indtægt er et engangskøb, man selv vælger.
5. **Ingen mørke mønstre.** Ingen nedtællinger, ingen «kun i dag», ingen gentagne popups.

## Hvad der er bygget nu

- **Home Assistant/web:** et diskret link til «Køb en kaffe» nederst på forsiden og i feedback-foden. Linket åbnes kun ved et tryk.
- **Android/Play:** kaffelinket er skjult. I stedet vises en lille **«☕ Støt»**-knap, der åbner en dialog:
  - er en betalingsbro `window.HSBETAALING` til stede, vises «Støt med 25 kr.»;
  - ellers vises kun en tak og en forklaring på, at alt er gratis.
- Dialogen lover intet, låser intet op og kan lukkes med «Ikke nu».

Koden ligger i `custom_components/hyggespil/www/stotte.js` og bruger `window.HSPLAY` fra `platform.js`.

## Næste skridt: Google Play Billing

1. Opret produktet i Play Console → **Monetize → Products → In-app products**:
   - ID: `stotte25`
   - Navn: «Støt Hyggespil»
   - Beskrivelse: «Frivillig støtte. Låser intet op.»
   - Pris: 25 DKK (eller nærmeste lokale pris)
2. Tilføj `com.android.billingclient:billing-ktx` i Android-appen.
3. Eksponér broen i `MainActivity`:

   ```kotlin
   web.addJavascriptInterface(object {
       @JavascriptInterface fun kob(id: String) { /* start Billing-flow */ }
   }, "HSBETAALING")
   ```

4. I `stotte.js` findes knappen allerede; den kalder `HSBETAALING.kob('stotte25')`.
5. Kvittering valideres i appen (Play Billing gør det), og der vises en tak. Der er intet at låse op.
6. På iOS bruges StoreKit 2 med samme bro-navn.

## Hvad der ikke gøres

- Ingen abonnementer. Et selskabsspil bruges i bølger; et abonnement ville straffe brugeren.
- Ingen reklamer. De ville især ramme børnene, som bruger spillet sammen med voksne.
- Ingen «premium-pakker» med spørgsmål. Alt indhold er fælles og udvides automatisk.
- Ingen eksterne betalingslinks i Play-udgaven (Googles betalingspolitik).
- Ingen kunstig begrænsning af puljer eller spil.

## Økonomi og formalia

- Google opkræver og afregner købet; udvikleren får en samlet udbetaling og **ingen** personoplysninger om køberen.
- Husk at registrere indtægten hos Skattestyrelsen (og moms, hvis der er momspligtig omsætning). Google udsteder bilag.
- Gem Play Console-rapporter som dokumentation. Der er ingen brugerdata at opbevare.
- Play tager en andel af hvert køb (aktuelt 15 % for små udviklere, 30 % ellers). Læs den gældende sats i Play Console.

## Måling uden sporing

Der bruges **ingen** analyseværktøjer. Vil man vide, om nogen støtter, findes svaret i Play Console og i bankudbetalingerne. Det er nok.
