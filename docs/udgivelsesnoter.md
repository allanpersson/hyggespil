### Rettet

- **Top og bund på Android:** indholdet blev tegnet under status- og navigationslinjen på Android 15+. Appen lægger nu selv sikkerhedsmargen, så kort og fod bliver synlige.
- **Foden på forsiden** var delt i to linjer, og kaffebilledet kunne dække knapperne. Nu er der én linje: version, støtte, feedback og «Om spillene».
- **Rumdialogen** viser nu rumkoden med det samme og lukker sig selv, når runden starter, så den ikke dækker spillet.
- **Flaskehalsen** holdt sig ikke inden for skærmen (12 px overløb); den skalerer nu efter pladsen.
- **Nyt spil i et rum** (fx skift fra quiz til «Forklar ordet») skiftede ikke spillens titel og kort; det gør det nu – også i Home Assistant-udgaven.

### Tilføjet

- **Fælles spil fra hver sin telefon – uden Home Assistant.** Én telefon opretter et rum og deler koden (fx `4821-KL`). De andre deltager og får deres egen skærm med spørgsmål, ture og point. Virker til quiz og til «Forklar ordet», hvor kun den, hvis tur det er, kan se kortet.
- Rummet er **krypteret med rumkoden**, sender kun kaldenavn og et tilfældigt enheds-id og virker både i browseren, på Android og senere på iOS.
- **Test af fælles spil** med to telefoner kører nu i CI sammen med systemtesten.
