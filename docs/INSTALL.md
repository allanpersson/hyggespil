# Installér uden at scanne hver gang

Android viser en **Play Protect-scanning**, når en app installeres uden om Google Play. Det er en sikkerhedsfunktion i styresystemet, og en app kan **ikke** slå den fra. Der er fire måder at undgå den daglige scanning:

## A. Google Play – intern test (anbefalet)

1. Upload AAB'en til **Play Console → Test and release → Testing → Internal testing**.
2. Tilføj din egen Google-konto som tester, og åbn testlinket på telefonen.
3. Installér **én gang** fra Play. Derefter opdaterer Play appen automatisk – uden scanning og uden installationsdialog.

Det kræver en Play-udviklerkonto (25 USD), men intern test er åben med det samme. Den lukkede test med 12 testere i 14 dage gælder kun, når appen skal ud i produktion.

## B. ADB over USB

Hvis telefonen er koblet til en computer med USB-debugging:

```bash
adb install -r hyggegames-0.2.xx.apk
```

`adb` installerer direkte uden installationsskærm og uden Play Protect-scanning. Brug `-r` for at beholde data ved opdatering. Det er den hurtigste vej til test på egen telefon.

## C. Obtainium (automatiske opdateringer fra GitHub)

1. Installér [Obtainium](https://github.com/ImranR98/Obtainium).
2. Tilføj `https://github.com/allanpersson/hyggespil-android`.
3. Giv Obtainium lov til at installere ukendte apps (Indstillinger → Apps → Obtainium → Installér ukendte apps).
4. Vil du helt slippe for Play Protect-spørgsmålet, kan du slå **Play Butik → profil → Play Protect → Indstillinger → Scan apps med Play Protect** fra. Det er en sikkerhedsafvejning – slå det kun fra, hvis du selv henter APK'er fra kilder, du stoler på.

Obtainium opdager nye GitHub-udgivelser og tilbyder opdatering. Selve installationen går gennem Androids installationsskærm, så Play Protect kan stadig spørge, medmindre scanningen er slået fra.

## D. Administreret enhed

Er telefonen en del af en virksomheds-/MDM-løsning (Device Owner), kan apps installeres og opdateres helt uden dialog. Det kræver, at enheden administreres – det er ikke noget, appen selv kan gøre.

## Hvorfor kan appen ikke bare gøre det?

Play Protect er en del af Google Play-tjenesterne og kører med systemrettigheder. En almindelig app må ikke installere andre apps eller ændre sikkerhedsindstillinger. Derfor er Play-vejen (A) eller ADB (B) de eneste helt friktionsfri løsninger.

**Tip:** Alle udgaver signeres med samme nøgle, så en ny APK kan installeres oven på den gamle uden at slette point og spillere. Hvis Android alligevel nægter, skyldes det næsten altid, at der er installeret en version med en anden signatur (fx en gammel debug- eller Play-udgave) – afinstallér den ene gang.
