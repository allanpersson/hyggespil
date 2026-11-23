### Rettet

- **Indstillinger (⚙)** åbner igen i både Home Assistant- og Android-udgaven. Et manglende platformstjek fik boksen til at fejle, og en fejl i bindingen kunne gøre «Start spil» død.
- **Feedback-knappen 💬** virker igen efter en navnekollision med lydmodulet.
- **Første gangs start** kræver ikke længere en 🔞-kode for at komme i gang.
- **Første start** viser nu altid velkomstboksen med navnefelter i stedet for den tomme spillermodal.

### Tilføjet

- **Aldersport:** 🔞 kræver en bekræftelse af, at man er fyldt 18, før man kan vælge eller bruge en kode. Koden er stadig valgfri og kan slås helt fra i en butiksudgave.
- **Fælles platformstjek** (`platform.js`), så Android-udgaven skjuler Home Assistant-, Music Assistant- og højttalerting.
- **Diskret «Støt»-knap** i Play-udgaven – ingen reklamer og ingen eksterne købslinks.
- **Systemtest** af indstillinger, første start, aldersport og Play-tilstand kører nu i CI.
- **Dokumentation:** `PLAY.md`, `OPHAVSRET.md`, `PLATFORM.md`, `IOS.md`, `INDTJENING.md`, `BUTIKSTEKST.md` og `PRIVACY.md`.
- **Spilnavne uden varemærker:** Ordhjulet, Opgavemesteren, Troldmandsfilmene, Tegnefilmsquiz, K-pop og dæmoner, Dødsspil og Grand Prix.
