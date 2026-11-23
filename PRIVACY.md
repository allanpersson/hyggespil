# Privatlivspolitik for Hyggespil

**Gælder for:** Hyggespil til Home Assistant (HACS/Marketplace), Android-appen og kommende iOS-app.
**Sidst opdateret:** 23. november 2026

Hyggespil er et selskabsspil, der kører på din egen enhed. Der er ingen konto, ingen reklamer, ingen sporing og ingen statistik. Spillet sender ikke oplysninger til udvikleren eller til tredjeparter.

## 1. Dataansvarlig

Allan Persson (eneejer), Danmark.
Kontakt: brug **Security → Report a vulnerability** eller en åben sag i [github.com/allanpersson/hyggespil](https://github.com/allanpersson/hyggespil). Skriv ikke personlige oplysninger i en åben sag.

## 2. Hvilke oplysninger behandles

Alle oplysninger gemmes **kun lokalt** på den enhed, der spilles på (browserens `localStorage` i Home Assistant, eller appens lokale lager i Android/iOS).

| Oplysning | Formål | Forlader enheden? |
|---|---|---|
| Spillernavne, farver og alder | vise ture, tilpasse sværhedsgrad | Nej |
| Point, grupper og afbrudte spil | fortsætte en aften | Nej |
| Egne spørgsmål, som brugeren selv skriver | bruge egne kort | Nej |
| Indstillinger (tid, lyd, oplæsning, musik) | huske valgene | Nej |
| 🔞-kode (kun saltet SHA-256-kontrolsum) | låse voksensektionen | Nej |
| Aldersbekræftelse (fødselsår + tidspunkt) | sikre, at 🔞 kun åbnes af voksne | Nej |

Der indsamles **ingen** navne, e-mailadresser, telefonnumre, IP-adresser, placeringsdata, kontakter, billeder eller enheds-id'er. Der er ingen cookies til sporing, ingen analyseværktøjer og ingen annoncenetværk.

## 3. Netværk

- **Home Assistant-udgaven** henter kun spillets egne filer fra din egen Home Assistant-installation. Oplæsning kan valgfrit bruge Home Assistants lokale TTS-tjeneste.
- **Android- og iOS-appen** henter spillets filer fra appen og virker helt uden internet. Appen har kun netværkstilladelse til **fælles spil fra hver sin telefon**: når du selv opretter eller deltager i et rum, sendes små, krypterede beskeder gennem den åbne beskedtjeneste ntfy.sh. Indholdet krypteres med rumkoden, og der sendes kun et kaldenavn og et tilfældigt enheds-id – ingen konto, e-mail eller telefonnummer. Uden et rum sendes intet.
- Eksterne links (fx GitHub) åbnes først i telefonens browser, når du selv trykker på dem.
- Spillet bruger ikke internettet til at hente spørgsmål, musik eller opdateringer under spil.

## 4. Køb og støtte

Appen er gratis og har ingen betalte niveauer. Hvis du vælger at støtte udviklingen med et køb i Google Play eller App Store, håndteres betalingen af butikken. Udvikleren modtager kun butikkens samlede salgsrapport og **ingen** personlige oplysninger. Abonnenter og køb kan administreres i butikkens egne indstillinger.

I Home Assistant-udgaven kan der være et link til en ekstern kaffe-side. Linket åbnes kun, hvis du selv trykker på det; der sendes ingen data fra spillet.

## 5. Børn og voksensektionen

Spillet kan bruges af familier, men indeholder også et afsnit for voksne (18+). Afsnittet er slået fra som standard og kræver:

1. en udtrykkelig aldersbekræftelse (fødselsår) på enheden, og
2. en kode på 4–8 cifre, som brugeren selv vælger.

Der indsamles ingen oplysninger om børn. Aldersbekræftelsen gemmes kun på enheden og kan fjernes ved at rydde appens data eller afinstallere appen. Spillet er ikke rettet mod børn under 13 som selvstændig målgruppe i appbutikkerne; se `docs/PLAY.md` om aldersmærkning.

## 6. Opbevaring og sletning

Oplysningerne ligger på din enhed, så længe du bruger spillet. Du sletter dem ved at:

- rydde appens data i telefonens indstillinger, eller
- afinstallere appen, eller
- i Home Assistant slette browserdata for den side, spillet kører på.

Der er ingen serverkopi, som udvikleren kan slette for dig – der findes ingen serverkopi.

## 7. Sikkerhed

Se `SECURITY.md` for en teknisk beskrivelse. Kort: appen har ingen netværkstilladelse, ingen filadgang, ingen eksekvering af ekstern kode og ingen backup af spillets data til skyen. 🔞-koden gemmes kun som en kontrolsum og kan nulstilles lokalt.

## 8. Ændringer

Hvis politikken ændres, opdateres datoen øverst, og ændringen beskrives i `CHANGELOG.md`. Der varsles ikke særskilt, fordi der ikke indsamles data, som en ændring kan få betydning for.

## 9. Dine rettigheder

Da der ikke behandles personoplysninger hos udvikleren, er der ikke noget at anmode om indsigt i, rette eller slette. Har du spørgsmål til, hvordan spillet håndterer data på din enhed, er du velkommen til at skrive via GitHub.
