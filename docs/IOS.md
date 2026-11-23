# iOS og fælles spil på tværs af platforme

Hyggespil er bygget som en webkerne, der kan pakkes i flere skins. Android er den første butiksapp; iOS skal genbruge kernen uden at spillene skrives igen.

## 1. iOS-appen

**Teknisk form:** Swift + `WKWebView`, der indlæser spillets filer fra appens bundle via et lokalt skema (fx `hyggespil://www/hs.html`), ikke fra en server.

| Del | Løsning |
|---|---|
| Spilfiler | kopieres fra `custom_components/hyggespil/www/` ved byg (samme synk som Android) |
| Lager | `localStorage` i WKWebView (persistent datastore) |
| TTS | bro til `AVSpeechSynthesizer` med `da-DK`; samme `speechSynthesis`-shim som Android |
| Netværk | ingen; App Transport Security kan stå på standard |
| Køb | StoreKit 2 til engangskøb («Støt med 25 kr.») |
| Flag | `window.HSA = { ios: true, play: true }` i `hs-app.js` |
| Backup | slås fra, så spillets data ikke ryger i iCloud uden brugerens valg |

`platform.js` sætter allerede `HSPLATFORM = 'ios'`, når `HSA.ios` er sat. Herefter skjules HA-funktioner på samme måde som på Android.

**App Store-krav, der skal huskes tidligt:**

- Apple-ID og Developer Program (99 USD/år).
- App Privacy: «Data Not Collected» (ingen indsamling).
- Age rating: 18+ hvis voksenafsnittet er med; ellers 12+/9+.
- Ingen eksterne købslinks; brug StoreKit.
- Kræver en Mac med Xcode til signering og upload (kan være en lejet Mac/CI-tjeneste).

## 2. Fælles spil på tværs af platforme

Fælles spil virker nu uden Home Assistant: værten har spilstanden i sin telefon, de andre telefoner sender handlinger, og tilstanden deles gennem en lille beskedtjeneste. Det er implementeret i `custom_components/hyggespil/www/rum-online.js` og virker i browser, Android og (når appen findes) iOS.

- **Vært:** den telefon, der opretter rummet, ejer spilstanden og udregner point.
- **Transport:** `ntfy.sh` i produktion (åben beskedtjeneste, intet login) eller et lokalt relay (`/rum/sub` og `/rum/pub` i `tools/serve.js`) til test og selvhosting.
- **Kryptering:** alle beskeder RC4-krypteres med rumkoden, så tjenesten kun ser volapyk. Private kort (Taboo) er desuden krypteret med hver spillers egen nøgle.
- **Rumkode:** fire cifre + to bogstaver, fx `4821-KL`.
- **Grænse:** ntfy.sh tillader 250 beskeder pr. dag pr. IP. Spillet sender kun beskeder ved handlinger og et hjerteslag hvert 25. sekund, så en almindelig spilledag holder sig inden for loftet. Til større brug kan man pege på sit eget relay.

Protokollen er stadig dokumenteret herunder, så en iOS-app kan tale med de andre platforme.

### Protokol: HSRUM/1

- **Rumkode:** 4 cifre + 2 bogstaver, fx `4821-KL`. Koden er hemmeligheden – der er ingen konti.
- **Vært:** den enhed, der opretter rummet, er autoritativ. Kun værten uddeler kort, point og ture.
- **Beskeder (JSON):**

  | Type | Retning | Indhold |
  |---|---|---|
  | `join` | klient → vært | rumkode, spillernavn, enheds-id (tilfældigt) |
  | `state` | vært → alle | spillere, tur, kort-id, point, fase |
  | `action` | klient → vært | `svar`, `naeste`, `gaet`, `stem` … |
  | `event` | vært → alle | lyd, animation, afsløring |
  | `bye` | begge | forlader rummet |

- **Ingen personoplysninger:** kun et kaldenavn og et tilfældigt id. Ingen e-mail, ingen konto, ingen IP gemmes.
- **Transport:** et lille WebSocket-relay. Tre muligheder:

  1. **Home Assistant** (findes): HA's websocket, når alle er på samme HA.
  2. **Offentligt relay** (til butiksapps): fx Cloudflare Durable Objects eller en lille Node-tjeneste. Rummet lever kun i spillets varighed og slettes efter 30 minutter uden aktivitet.
  3. **Lokal LAN/WebRTC** (senere): fx MultipeerConnectivity på iOS og Nearby Connections på Android, uden server.

- **Sikkerhed:** rumkoden er adgangsnøglen; den deles mundtligt eller via QR. Værten afviser ukendte id'er, og alle beskeder valideres. Der sendes ingen filer – kun små JSON-beskeder.

### Implementering i kernen

```js
// rum-transport.js (ny)
window.HSRUM = {
  forbind(transport) { /* 'ha' | 'ws' | 'lokal' */ },
  send(type, data) {},
  modtag(callback) {},
};
```

Spillets `rum.js` bruger i dag HA direkte. Det ændres, så den kun kalder `HSRUM`, og HA-transporten bliver én implementering blandt flere. Så virker samme rumkode på HA, Android og iOS.

## 3. Milepæle

| # | Mål | Afhænger af |
|---|---|---|
| 1 | Android på Play (første udgivelse) | `docs/PLAY.md` |
| 2 | iOS-app med samme kerne | Mac/Xcode, Apple-konto |
| 3 | `HSRUM` med HA-transport (uændret adfærd) | refaktor af `rum.js` |
| 4 | Offentligt relay + rumkoder på tværs af Android/iOS | lille server + drift |
| 5 | Lokal LAN/WebRTC uden server | platformsbiblioteker |

## 4. Åbne spørgsmål

- Skal voksenafsnittet med i iOS-udgaven? Samme svar som for Play (kan slås fra med `udenVoksen`).
- Skal relayet være gratis og offentligt, eller skal det kunne selvhostes? (Anbefaling: begge – standard til en lille gratis instans, og en indstilling til egen server.)
- Skal der være en fælles «vært» på tværs af enheder, eller kan enhver tage over? (Anbefaling: værten kan overdrage, men kun eksplicit.)
