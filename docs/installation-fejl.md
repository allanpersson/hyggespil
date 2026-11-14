# Hvis Marketplace/HACS ikke vil installere Hyggespil

Den mest almindelige fejl er:

> **The installed content has no usable manifest.json … /config/custom_components/hyggespil/manifest.json**

Den betyder, at Home Assistant efter udpakningen ikke kan finde `manifest.json` i
`config/custom_components/hyggespil/`. Årsagen har været vores udgivelses-zip: den var pakket ind i
endnu en `custom_components/hyggespil/`-mappe. Både Home Assistant Marketplace og HACS pakker nemlig
zippet ud **direkte** i `config/custom_components/hyggespil`, så filerne endte i
`config/custom_components/hyggespil/custom_components/hyggespil/…`.

**Det er rettet fra version 0.2.0:** zippet har nu integrationens filer i roden (`manifest.json`,
`__init__.py`, `www/`, …), og CI afviser en udgivelse, hvis ikke det er tilfældet.

## Sådan kommer du videre

1. **Opdater til 0.2.0 eller nyere** i Indstillinger → Marketplace → Hyggespil.
2. **Genstart Home Assistant** (Indstillinger → System → Genstart). En ny integration bliver først
   indlæst ved genstart.
3. **Ser du stadig den gamle fejl:** fjern Hyggespil i Marketplace, genstart, og tilføj repoet igen:
   `https://github.com/allanpersson/hyggespil`, type **Integration**. Marketplace husker ellers den
   gamle, fejlede download.
4. **Hvis mappen er blevet halvt udpakket:** slet `config/custom_components/hyggespil` (også
   `__pycache__`), genstart, og hent igen fra Marketplace.

## Reservevej uden Marketplace/HACS

1. Hent `hyggespil.zip` fra den nyeste udgivelse: <https://github.com/allanpersson/hyggespil/releases/latest>
2. Pak zippet ud i `config/custom_components/hyggespil/`, så `manifest.json` ligger direkte i den mappe.
3. Genstart Home Assistant og tilføj integrationen under **Indstillinger → Enheder og tjenester**.

## Sådan tjekker du, hvilken version du har

Versionen står nederst på spillets forside, fx **Hyggespil 0.2.0**.

## Sådan undgår vi, at det sker igen

- `tools/tjek_installation.py` udpakker zippet præcis som Marketplace/HACS gør og kræver, at
  `manifest.json` ligger i roden med en `x.x.x`-version. Den kører i CI ved hver ændring og før hver
  udgivelse.
- `tools/tjek_manifest.py` afviser et manifest, Home Assistant ikke vil indlæse.
- Udgivelser er almindelige `x.x.x`-versioner (ikke prereleases), fordi Marketplace læser
  `/releases/latest`, som springer prereleases over – ellers viser Marketplace en commit-SHA i stedet
  for en version.
