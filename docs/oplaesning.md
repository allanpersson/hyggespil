# Oplæsning af spørgsmål

Hyggespil kan læse spørgsmålene højt, så man ikke skal holde øje med skærmen – godt når bordet er
stort, når nogen ser dårligt, eller når spillet kører på tv'et.

## Slå det til

1. Vælg et spil på forsiden.
2. I boksen **inden spillet starter** (eller med **⚙** undervejs) finder du **🔊 Oplæsning af spørgsmål**.
3. Sæt flueben i «Læs spørgsmålet op, når det vises», vælg stemme og hastighed, og tryk **Prøv**.
4. Start spillet. Hvert nyt spørgsmål læses op.

**🔊** i spillets bjælke læser det aktuelle spørgsmål igen; tryk én gang mere for at stoppe.
Valgene huskes på enheden, men oplæsning er **slået fra som standard**.

## Hvilke spil læses op?

Spørgsmåls-, kort- og udfordringsspillene. Spil hvor oplæsning ville afsløre svaret – Forbudte ord,
Gæt og vis, Lykkehjulet – læses ** ikke** op. Det samme gælder bræt- og 3D-spillene.

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
