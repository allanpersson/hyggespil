# Google Play – køreplan og krav

Denne fil er tjeklisten for at få Hyggespil på Google Play som en **separat app** fra Home Assistant-udgaven. Begge udgaver bruger samme spilfiler, men Android-appen er strippet for Home Assistant-funktioner og finjusteret til telefonen (se `docs/PLATFORM.md`).

Sidst kontrolleret: 23. november 2026. Kilder er Googles egne sider, og de er nævnt løbende.

## 1. Status lige nu

| Krav | Status | Hvor |
|---|---|---|
| Separat Android-app | ✅ | `allanpersson/hyggespil-android` |
| App-id og versionskode | ✅ | `dk.allanpersson.hyggespil` |
| Mål-API 36 (Android 16) | ✅ | `app/build.gradle.kts` |
| AAB til Play | ✅ | bygges i CI som artifact |
| Signering med upload-nøgle | ⚠️ kræver hemmelig nøgle | se § 3 |
| Netværk kun til fælles rum | ✅ | `AndroidManifest.xml` (INTERNET, bruges kun ved rum) |
| Ingen backup af data | ✅ | `allowBackup="false"` |
| Privatlivspolitik | ✅ | `PRIVACY.md` |
| Ingen reklamer/sporing | ✅ | ingen SDK'er |
| Aldersport for 🔞 | ✅ | fødselsår + egen kode |
| Varemærker gennemgået | ✅ | `docs/OPHAVSRET.md` |
| Butikstekst og grafik | ⚠️ mangler upload | se § 4 |
| Lukket test med 12 testere i 14 dage | ⚠️ mangler | se § 7 |
| Udviklerkonto og identitetskontrol | ⚠️ Allan | se § 2 |

## 2. Konto og adgang (gøres én gang)

1. Opret en **Google Play Console-konto** (25 USD, engangsbeløb) på <https://play.google.com/console>.
2. Vælg kontotype:
   - **Personlig konto**: kræver identitetsbekræftelse (pas/kørekort) og en **device verification** af den telefon, der bruges. Nye personlige konti (oprettet efter 13. november 2023) skal gennemføre en lukket test med **mindst 12 testere, der har været tilmeldt i mindst 14 dage i træk**, før produktion åbnes.
   - **Organisation**: kræver CVR/foreningsoplysninger og en verificerbar hjemmeside/e-mail på domænet. Vælges, hvis Hyggespil skal stå som firma.
3. Udfyld **Developer profile** (navn, e-mail, hjemmeside) – det vises i butikken.
4. Opret appen med:
   - Navn: **Hyggespil**
   - Sprog: Dansk
   - App eller spil: **Spil**
   - Gratis
   - Deklarationer: se § 5.

Kilder: [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465), [Device verification](https://support.google.com/googleplay/android-developer/answer/14316361).

## 3. Tekniske krav

| Krav | Hyggespil |
|---|---|
| Mål-API | **36 (Android 16)** fra 31. august 2026 for nye apps og opdateringer ([kilde](https://support.google.com/googleplay/android-developer/answer/11926878)) |
| Format | **AAB** (APK må ikke uploades) |
| Signering | Play App Signing + **egen upload-nøgle** |
| versionCode | `a*1.000.000 + b*10.000 + c*100 + d` (fx 0.2.67 → 26700) |
| 64-bit | Ja (Kotlin/Java, ingen native libs) |
| Permissions | `INTERNET` – bruges kun til fælles rum; intet sendes ellers |
| Backup | Slået fra (`allowBackup="false"`) |
| WebView | Kun lokale filer, filadgang og mixed content slået fra, eksterne links kræver https + whitelist |
| Debug | `WebView.setWebContentsDebuggingEnabled(false)` i release |

### Upload-nøgle – vigtigt

Den faste nøgle i `sideload/` ligger offentligt i repoet, så alle selvinstallerede builds har samme signatur. **Den må ikke bruges som Play-upload-nøgle.**

1. Lav en ny nøgle lokalt (én gang):

   ```bash
   keytool -genkeypair -v -keystore play-upload.p12 -storetype PKCS12 \
     -alias hyggespil-play -keyalg RSA -keysize 4096 -validity 10000
   ```

2. Gem den som GitHub-secrets i Android-repoet:
   `ANDROID_KEYSTORE` (base64 af filen), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
3. Workflowen bruger automatisk nøglen fra miljøet, når den findes. Tag backup af nøglen et sikkert sted – uden den kan du ikke uploade opdateringer (med mindre du får nulstillet upload-nøglen hos Google).
4. Slå **Play App Signing** til ved første upload. Google opbevarer herefter app-signeringsnøglen.

## 4. Butiksmateriale

| Element | Krav | Status |
|---|---|---|
| App-ikon | 512 × 512 px PNG, 32-bit | Kan genereres fra `mipmap` |
| Feature-grafik | 1024 × 500 px | Mangler |
| Telefon-skærmaftryk | 2–8 stk., 16:9 eller 9:16, min. 1080 px | Mangler |
| Tablet-skærmaftryk | valgfrit, men anbefales | Mangler |
| Kort beskrivelse | max 80 tegn | Udkast i `docs/BUTIKSTEKST.md` |
| Fuld beskrivelse | max 4.000 tegn | Udkast i `docs/BUTIKSTEKST.md` |
| Kontakt-e-mail | kræves | Allans offentlige e-mail |
| Privatlivspolitik | offentlig URL | `https://github.com/allanpersson/hyggespil/blob/main/PRIVACY.md` |

Skærmaftrykkene skal vise spillet uden 🔞-indhold og uden personnavne. Brug testspillere som «Spiller 1» og «Spiller 2».

## 5. App Content – deklarationer

Udfyldes under **Policy → App content**:

| Spørgsmål | Svar |
|---|---|
| Privatlivspolitik | `https://github.com/allanpersson/hyggespil/blob/main/PRIVACY.md` |
| Reklamer | **Nej**, appen viser ingen reklamer |
| App-adgang | Alt er åbent, ingen login |
| Målrettet børn | **Nej** (18+ på grund af voksensektionen). Vælges «Ja», kommer appen i Families-programmet, hvor voksenindhold ikke er tilladt |
| Nyhedsapp | Nej |
| COVID-19 | Nej |
| Finansielle funktioner | Nej |
| Sundhed | Nej |
| Offentlig myndighed | Nej |
| Brugergenereret indhold | **Nej** – egne spørgsmål gemmes kun lokalt og deles ikke |
| Datasikkerhed | Ingen indsamling og ingen deling. Data sendes kun, hvis brugeren selv starter et fælles rum; indholdet er ende-til-ende-krypteret med rumkoden (ntfy.sh ser kun krypteret tekst). |

### Content rating (IARC)

Spørgeskemaet giver formentlig **PEGI 18 / Mature 17+** på grund af:

- Tekstlige voksenudfordringer i 🔞-sektionen (seksuelle temaer, forslag – ikke billeder).
- Alkohol i «Jeg har aldrig» og «Vinudfordringer».
- Lette trusler/skreak i «Dystre valg».

Svar ærligt: *Sexuality → yes (suggestive text)*, *Alcohol → yes*, *Violence → no*, *Language → mild*. Læs Googles [Sexuality and Nudity policy](https://support.google.com/googleplay/android-developer/answer/9876937) før upload.

**Anbefaling:** Hvis Google afviser på grund af voksenindhold, kan Play-udgaven bygges uden sektionen med ét flag:

```js
// i app/src/main/assets/www/hs-app.js
window.HSA = { android: true, play: true, udenVoksen: true };
```

Så forsvinder 🔞-knappen, aldersporten og alle voksenspil, mens Home Assistant- og sideload-udgaven beholder dem. Det kræver ingen ændring i spillets øvrige filer.

## 6. Betaling

Appen er gratis. Der er ingen abonnementer, ingen loot boxes og ingen reklamer.

- Play-udgaven viser en diskret **«☕ Støt»**-knap. Uden en betalingsbro viser den kun en tak og **ingen** link til køb uden for butikken.
- Skal der tjenes penge, bruges **Google Play Billing** til et engangskøb («Støt med 25 kr.»). Det kræver:
  - Play Console → Monetize → Products → In-app products → opret `stotte25`.
  - Billing-bibliotek i Android-appen og en JS-bro `window.HSBETAALING = { kob: id => ... }`.
  - At der ikke linkes til eksterne betalingssider i Play-udgaven (Googles [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818)).
- Alle køb er frivillige og låser intet op. Det holder appen inden for «gratis»-kategorien og undgår reklamer.

## 7. Test og udgivelse

1. **Intern test** (valgfri): upload AAB til Internal testing, installér på 2–3 telefoner.
2. **Lukket test**: opret en closed track, invitér **mindst 12 testere**, og sørg for at de bliver tilmeldt i **14 dage i træk**. Test:
   - første gangs start (navne, ingen kode)
   - aldersport og 🔞-kode
   - indstillinger (⚙), oplæsning, musik
   - mindst 10 forskellige spil, også et med indtastning og et med globus
   - «← Alle spil» lander det rigtige sted
   - rotation, baggrundslyd, telefonens TTS
   - offline: flytilstand må ikke ændre noget
3. Saml feedback (Play Console → Testing feedback). Skriv en kort opsummering – den skal bruges i ansøgningen.
4. **Ansøg om produktion** på Dashboard. Svar på alle tre afsnit: om testen, om appen og om parathed.
5. **Pre-launch report**: tjek crashes, tilgængelighed og skærmstørrelser.
6. Udrul gradvist (10 % → 50 % → 100 %) og følg ANR/crash-fri brug.

## 8. Ved hver opdatering

- [ ] `versionCode` er højere end sidst (følger spillets version automatisk)
- [ ] `CHANGELOG.md` har et afsnit til versionen
- [ ] AAB er bygget og signeret med upload-nøglen
- [ ] Testet på mindst én fysisk telefon
- [ ] Skærmaftryk opdateret, hvis UI er ændret
- [ ] Data safety og content rating stadig passer (især hvis nyt indhold)
- [ ] Ingen nye permissions eller SDK'er

## 9. Kendte risici

| Risiko | Håndtering |
|---|---|
| Voksenindhold afvises | `udenVoksen`-flag i Play-udgaven |
| Varemærker i spilnavne | Navne gennemgået og ændret, se `docs/OPHAVSRET.md` |
| «Lykkehjulet»-design minder om tv-udgaven | Egen tegning, generiske felter; referencefoto er ikke i repoet |
| Offentlig sideload-nøgle | Bruges kun til GitHub-APK, aldrig Play |
| Mange små versioner | Play kræver kun højere versionCode; versioner kan slås sammen til én ugentlig |

## 10. Kilder

- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Content ratings](https://support.google.com/googleplay/android-developer/answer/9898842)
- [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818)
- [Sexuality and Nudity](https://support.google.com/googleplay/android-developer/answer/9876937)
