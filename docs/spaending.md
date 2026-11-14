# Timer, hurtige svar og spænding i lyset

Hyggespil kan gøre aftenen mere spændende: en nedtælling pr. spørgsmål, ekstra point for et
hurtigt svar, lokalt musik i de sidste sekunder – og et lys, der pulserer, jo tættere man er på
udløb. Alt sammen kører lokalt i Home Assistant; intet sendes ud af huset.

## Sådan bruger du det i spillet

Når du vælger et spil på forsiden, åbner en boks **inden spillet starter**:

| Indstilling | Betydning |
|---|---|
| **⏱️ Tid pr. spørgsmål** | Ingen, 30, 45, 60, 90, 120 sekunder eller din egen tid. Nedtællingen vises nederst til højre og bliver rød, når tiden er ved at løbe ud. |
| **⚡ Ekstra point for hurtigt svar** | 0–3 point, hvis svaret gives inden for det valgte antal sekunder (standard 10). Gives én gang pr. spiller pr. spørgsmål. |
| **🎵 Spændingsmusik** | Vælg en lydfil fra din enhed. Den spiller de sidste X sekunder af nedtællingen (standard 10) og stopper, når tiden er gået. Filen gemmes kun på den enhed, du spiller på. |

Undervejs kan du ændre det hele med **⚙** i spillets bjælke. Valgene huskes næste gang.

Nedtællingen gælder ikke bræt-, terning- og 3D-spillene (Rødt lys/grønt lys, Glasbroen,
Lykkehjulet, Yut Nori osv.), hvor en tid pr. spørgsmål ikke giver mening. Musik kræver, at der er
valgt en tid.

### Hvor gemmes det?
- Indstillingerne ligger i browserens `localStorage` (`hs_valg`).
- Musikfilen ligger i browserens `IndexedDB` (`hs_musik`), maks. 8 MB.
- Der sendes **kun** spillets tilstand til Home Assistant – ikke navne på andre enheder, ikke filer.

Browserens politik for lyd betyder, at musikken først må spille efter et klik. Det klik, du giver,
når du starter spillet, tæller som tilladelse.

## Sensor til automatiseringer

Integrationen opretter sensoren **`sensor.hyggespil_spil`**. Spillet opdaterer den cirka én gang i
sekundet, mens der spilles.

| Tilstand | Betydning |
|---|---|
| `klar` | Der spilles ikke |
| `spiller` | Et spil er i gang |
| `slut` | Spillet er afsluttet, og stillingen vises |

Attributter:

| Attribut | Indhold |
|---|---|
| `spil`, `spil_navn` | Spillets id og navn, fx `tf` / «Sandt eller falsk» |
| `spillere` | Navnene på spillerne i gruppen |
| `sekunder` | Sekunder tilbage af nedtællingen (0 = tiden er gået) |
| `tid` | Den valgte tid |
| `urgency` | 0 i starten → 1 ved udløb |
| `puls` | Et hjertebank 0–1, der går hurtigere og kraftigere mod udløb |
| `musik` | Om der er valgt et musikstykke |
| `opdateret` | Tidspunkt for seneste opdatering (ISO 8601) |

Der sendes også hændelsen **`hyggespil_spil_status`** med samme data, hvis du hellere vil lytte
efter en hændelse end at følge en sensor.

### Test uden at spille

Udviklerværktøjer → Tjenester → `hyggespil.status`:

```yaml
action: hyggespil.status
data:
  state: spiller
  spil: tf
  spil_navn: Sandt eller falsk
  sekunder: 20
  tid: 30
  urgency: 0.33
  puls: 0.8
```

Sensoren skifter med det samme, og du kan se lyset reagere.

## Færdig automation (blueprint)

Importér blueprinte­n i Home Assistant:

1. Indstillinger → Automatiseringer og scener → Blueprints → **Importér blueprint**.
2. Indsæt:
   `https://github.com/allanpersson/hyggespil/blob/main/blueprints/automation/hyggespil/spaending.yaml`
3. Opret en automatisering ud fra den, vælg lamper og farve.

Blueprinte­n findes også i repoet: `blueprints/automation/hyggespil/spaending.yaml`.
Den lytter på sensoren og lader lyset skifte mellem svag og kraftig lysstyrke – hurtigere og med
større udsving, jo højere `urgency` er. Da `repeat.index` skifter for hvert slag, bliver det et
regelmæssigt «pulsslag» frem for en jævn dæmpning.

## Egen automation uden blueprint

```yaml
automation:
  - alias: Hyggespil – puls i stuen
    triggers:
      - trigger: state
        entity_id: sensor.hyggespil_spil
        to: "spiller"
    actions:
      - repeat:
          while:
            - condition: state
              entity_id: sensor.hyggespil_spil
              state: "spiller"
            - condition: template
              value_template: "{{ state_attr('sensor.hyggespil_spil','sekunder') | float(0) > 0 }}"
          sequence:
            - action: light.turn_on
              target:
                entity_id: light.stue
              data:
                brightness_pct: >-
                  {{ (10 + 90 * (state_attr('sensor.hyggespil_spil','urgency') | float(0))) | round(0) }}
                rgb_color: [255, 60, 90]
            - delay:
                milliseconds: >-
                  {{ (1000 - 850 * (state_attr('sensor.hyggespil_spil','urgency') | float(0))) | round(0) }}
```

`puls`-attributten kan bruges, hvis du vil styre noget andet end lysstyrke – fx en højttaler, en
vibrator eller farven på en lampe:

```yaml
data:
  brightness_pct: "{{ (20 + 80 * state_attr('sensor.hyggespil_spil','puls') | float(0)) | round(0) }}"
```

## Godt at vide

- Sensoren oprettes først, når integrationen er genindlæst efter opdateringen (genstart Home
  Assistant).
- Spillet sender kun, når det kører i Home Assistants panel. Åbner du spillet direkte i en browser
  uden Home Assistant, sker der ingenting – spillet virker stadig.
- Der sendes højst én opdatering i sekundet for at skåne installationen.
- Alt er valgfrit: uden tid og uden musik opfører spillet sig som før.
