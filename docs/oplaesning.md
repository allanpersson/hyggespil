# Oplæsning af spørgsmål

Hyggespil kan læse spørgsmålene højt, så man ikke skal holde øje med skærmen – godt når bordet er
stort, når nogen ser dårligt, eller når spillet kører på tv'et.

## Slå det til

1. Vælg et spil på forsiden – boksen med indstillinger åbner første gang (senere med **⚙**).
2. Under **🔊 Oplæsning af spørgsmål** sætter du flueben i «Læs spørgsmålet op, når det vises»,
   vælger stemme og hastighed, og trykker **Prøv**.
3. Start spillet. Hvert nyt spørgsmål læses op.

**I Home Assistant-appen** findes telefonens browserstemme ikke. Vælg i stedet telefonens
Companion-app under **📱 Læs op på telefonen** (fx `mobile_app_din_telefon`). Så læses spørgsmålet op
i telefonens egen højtaler via en TTS-notifikation, og **lys-automationen kører uændret videre**,
fordi den kun bruger `sensor.hyggespil_spil`. Har du præcis én Companion-app, vælges den automatisk.
Du kan også åbne spillet i Chrome, hvor browserens stemmer virker.

**🔊** i spillets bjælke læser det aktuelle spørgsmål igen; tryk én gang mere for at stoppe.
Valgene huskes på enheden, og oplæsning er **slået til som standard** (enhedens egen højtaler).

Mens der læses op, dæmpes spændingsmusikken til ca. 14 %, så stemmen altid kan høres – musikken
fortsætter og går op igen bagefter.

## Hvilke spil læses op?

Spørgsmåls-, kort- og udfordringsspillene. Spil hvor oplæsning ville afsløre svaret – Forbudte ord,
Gæt og vis, Lykkehjulet – læses ** ikke** op. Det samme gælder bræt- og 3D-spillene.

## Når appen ikke kan læse op

Home Assistant-appen viser panelet i en **WebView**. På Android giver den ikke spillet adgang til
telefonens tale, og så hjælper det ikke, at dansk tekst-til-tale er installeret og valgt i systemet.
Spillet opdager det og tilbyder:

- **Åbn i Chrome** – åbner samme side i telefonens browser, hvor oplæsningen virker.
- **Home Assistant-højttaler** – vælg `tts`- og `media_player`-enhederne under ⚙ → Oplæsning, så
  læses spørgsmålene op i stuen i stedet.

På iPhone/iPad gælder det samme: Safari læser op, mens appens indbyggede browser ikke gør.

## To måder at tale på

### 1. Enhedens egen stemme (standard)

Bruger browserens indbyggede tale (Web Speech API). Stemmerne ligger på telefonen, tabletten eller
pc'en, og der sendes intet over nettet. Hvilke stemmer der findes, afhænger af enheden:

- **Windows/macOS:** flere stemmer, oftest også en dansk (fx «Microsoft Helle»).
- **Android/Chrome:** bruger systemets tale. Er der ingen dansk stemme, kan man hente en under
  **Indstillinger → System → Sprog og input → Tekst-til-tale**.
- **iPhone/iPad:** bruges Siri-stemmerne under **Indstillinger → Tilgængelighed → Oplæst indhold**.

Klarer enheden ikke dansk, læses teksten med den nærmeste nordiske stemme, ellers med standardstemmen.
Det er stadig forståeligt, men udtalen bliver derefter.

### 2. En Home Assistant-højttaler

Vil du hellere have lyden ud af højttalerne i stuen, kan spillet kalde Home Assistants egen
tale-tjeneste. Udfyld to felter i indstillingerne:

| Felt | Eksempel | Betydning |
|---|---|---|
| tts-entity | `tts.piper` | Den tale-tjeneste, du vil bruge |
| media_player | `media_player.stue` | Højttaleren, der skal tale |

Begge felter skal være udfyldt – ellers læses der op i browseren. Spillet kalder:

```yaml
action: tts.speak
target:
  entity_id: tts.piper
data:
  media_player_entity_id: media_player.stue
  message: "Fodbold spilles med elleve spillere på hvert hold"
```

Det kræver, at du har en tale-tjeneste og en medieafspiller i Home Assistant i forvejen (fx
Piper/Google Translate til tale og en højttaler, der kan afspille medier).

## Privatliv

- Browserstemmer: intet forlader enheden.
- HA-højttaler: teksten sendes kun til din egen Home Assistant.
- Spillernavne og point læses aldrig op – kun spørgsmålet på skærmen.

## Kendte grænser

- Kvaliteten og udvalget af stemmer afhænger helt af enheden og styresystemet.
- Nogle browsere kræver, at man har trykket på siden, før der må afspilles lyd. Det klik, du giver
  ved «Start spil», tæller.
- Oplæsning via Home Assistant er implementeret og dokumenteret, men ikke afprøvet i en kørende
  installation endnu.
