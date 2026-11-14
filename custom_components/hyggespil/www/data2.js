/* Hyggespil – flere puljer. Nye elementer tilføjes i bunden. Daglige tilføjelser ligger i extra.json */
Object.assign(window.DATA,{
// Hvem gjorde det? s=scene, c=spor (afsløres ét ad gangen), p=mistænkte, a=index på skyldig, e=opklaring
mys:[
{t:"Den forsvundne fødselsdagskage",s:"Kl. 15 er mandelkagen væk fra køkkenbordet. Den stod på øverste hylde (150 cm).",c:["Der er tydelige gaffelmærker i kagefadet – ingen poteaftryk.","Skamlen står stadig ved spisebordet, og Sofus er kun 110 cm høj.","Onkel Kjeld er dødallergisk over for mandler.","Der ligger en strikkepind på sofaen, hvor der er krummer."],p:["Bedstemor","Onkel Kjeld","Sofus (6 år)","Hunden Bjørn"],a:0,e:"Gaflerne udelukker hunden, Sofus kunne ikke nå kagen, og Kjeld ville aldrig røre mandler. Bedstemor – strikkepinden afslører hende."},
{t:"Den forsvundne rødvin",s:"Under middagen forsvinder aftenens bedste flaske fra køkkenet.",c:["Værten Mette stod i stuen med alle gæster hele aftenen – 8 vidner.","Kokken Ida står på overvågningsbilledet i køkkenet hele tiden.","Lars kører bil og drikker ikke alkohol.","Der er friske rødvinspletter på Pouls hvide ærme."],p:["Værten Mette","Lars","Kokken Ida","Naboen Poul"],a:3,e:"Mette har vidner, Ida er filmet, Lars drikker ikke – og Pouls ærme afslører ham."},
{t:"Wifi-sabotagen",s:"Kl. 20 forsvinder wifi midt i Champions League. Routeren er gemt bag sofaen.",c:["Stikket er trukket ud – man skal kravle om bag sofaen.","Mor og far sad i sofaen og så kampen – de ville aldrig afbryde den.","Bedstefar har dårlig ryg og kan ikke kravle.","Emil blev hørt sige: «Så skal vi bare spille brætspil i aften!»"],p:["Far","Mor","Emil (teenager)","Bedstefar"],a:2,e:"Emil ville have familien til at spille brætspil – og det gør I jo nu."},
{t:"Kaffemaskinens fald",s:"Kontorets kaffemaskine er gået i stykker. Vandbeholderen er fyldt med mælk.",c:["Tina drikker kun te og rører aldrig maskinen.","Jens har lavet kaffe på den i 6 år og kender den ud og ind.","Karen har selv bestilt maskinen og er instrueret i den.","Noah startede i mandags og har endnu ikke fået en introduktion."],p:["Tina","Jens","Karen (chef)","Noah (praktikant)"],a:3,e:"Kun den nye vidste ikke, at maskinen kun vil have vand."},
{t:"Mudderspor på det hvide gulv",s:"En hvid entré er plettet af mudder – og sporene er tydelige.",c:["Sporene viser to fødder – ikke fire.","Skostørrelsen er ca. 46.","Lille Mads har str. 30, og mor har str. 38.","Postbuddet var forbi kl. 11 med en pakke."],p:["Hunden","Lille Mads","Mor","Postbuddet"],a:3,e:"To fødder, str. 46 – kun postbuddet passer."},
{t:"Diamanten på slottet",s:"Mellem kl. 21 og 22 forsvinder en diamant fra grevindens spejlsal.",c:["Butleren serverede te for 12 gæster hele timen.","Grevinden talte i telefon med sin søster fra 21:05 til 21:55.","Kokken har været i gang med desserten og blev set af fire kokkeelever.","Der er jord på det hvide tæppe og afrevne roser i vinduet."],p:["Butleren","Grevinden","Kokken","Gartneren"],a:3,e:"Alle andre har alibi – og jorden og rosenbladene peger på gartneren."},
{t:"Sparegrisen",s:"Der mangler 20 kr. i sparegrisen. Den er åbnet fra bunden med en køkkenkniv kl. 12:30.",c:["Katten kan ikke bruge en kniv.","Lillesøster (5 år) må ikke røre køkkenknive og kan ikke nå dem.","Storebror er i skole til kl. 13.","Under grisen ligger en seddel: «Skylder dig 20 kr. – B.»"],p:["Storebror","Lillesøster","Katten","Bedstemor"],a:3,e:"Seddelen er underskrevet B. – Bedstemor."},
{t:"Den forsvundne chokolade",s:"Den store chokoladeplade fra skabet er væk, og papiret ligger foldet.",c:["Hunden kan ikke folde papir.","Ida har nøddeallergi, og chokoladen indeholdt nødder.","Mor er på diæt og har det bedste vidne: sin vægt.","Der er chokoladeaftryk på fjernbetjeningen – og kun far styrer tv'et."],p:["Far","Mor","Ida","Hunden"],a:0,e:"Fjernbetjeningen afslører far."}
],
// Gåder
riddle:[
{q:"Hvad har en nøgle, men åbner ingen låse?",a:"Et klaver (eller et tastatur)"},
{q:"Hvad kan man bryde uden at røre ved det?",a:"Et løfte"},
{q:"Hvad bliver vådere, jo mere det tørrer?",a:"Et håndklæde"},
{q:"Hvad har hænder, men kan ikke klappe?",a:"Et ur"},
{q:"Hvad har et hoved og en hale, men ingen krop?",a:"En mønt"},
{q:"Jo mere du tager, jo mere efterlader du. Hvad er det?",a:"Fodspor"},
{q:"Hvad kan rejse jorden rundt, mens det bliver i et hjørne?",a:"Et frimærke"},
{q:"Hvad har byer uden huse, skove uden træer og vand uden fisk?",a:"Et kort"},
{q:"Hvad kommer én gang i et minut, to gange i et øjeblik, men aldrig i tusind år?",a:"Bogstavet M"},
{q:"Hvad har tænder, men kan ikke bide?",a:"En kam"},
{q:"Hvad bliver større, jo mere man tager fra det?",a:"Et hul"},
{q:"Hvad har ét øje, men kan ikke se?",a:"En nål"},
{q:"Hvad går op, men aldrig ned?",a:"Din alder"},
{q:"Hvad har en ryg, men ingen ben?",a:"En bog"},
{q:"Du ser mig i vand, men jeg bliver aldrig våd. Hvad er jeg?",a:"Et spejlbillede"},
{q:"Hvad kan fylde et rum uden at tage plads?",a:"Lys"},
{q:"En mand skubber sin bil hen til et hotel og mister sin formue. Hvad er der sket?",a:"Han spiller Monopoly"},
{q:"Hvilken måned har 28 dage?",a:"Alle måneder"},
{q:"Hvad kan man fange, men ikke kaste?",a:"En forkølelse"},
{q:"Hvad ligger på bunden af havet og ryster?",a:"Et nervøst vrag"},
{q:"Hvad er hvidt, når det er beskidt?",a:"En tavle"},
{q:"Hvad har 13 hjerter, men ingen andre organer?",a:"Et sæt spillekort"},
{q:"Hvis du har det, vil du dele det. Hvis du deler det, har du det ikke længere. Hvad er det?",a:"En hemmelighed"},
{q:"Hvad har en tunge, men kan ikke tale?",a:"En sko"},
{q:"En far er 40 år og hans søn 10 år. Om hvor mange år er faren tre gange så gammel som sønnen?",a:"Om 5 år (45 og 15)"},
{q:"5 maskiner laver 5 produkter på 5 minutter. Hvor lang tid tager det 100 maskiner at lave 100 produkter?",a:"5 minutter"},
{q:"En flaske og en prop koster tilsammen 11 kr. Flasken koster 10 kr. mere end proppen. Hvad koster proppen?",a:"50 øre"},
{q:"En sø er dækket af åkander, og arealet fordobles hver dag. Efter 48 dage er hele søen dækket. Hvornår var den halvt dækket?",a:"Efter 47 dage"},
{q:"Jeg taler uden mund og hører uden ører. Jeg har ingen krop, men vågner til live med vinden. Hvad er jeg?",a:"Et ekko"},
{q:"Hvad kan man have, uden at have det? (Hvis man har det, siger man det ikke.)",a:"En hemmelighed"}
],
// Hvem/hvad er jeg? c = 5 spor fra svært til let (færre spor = flere point)
who:[
{a:"Eiffeltårnet",c:["Jeg er lavet af smedejern.","Jeg blev bygget til en verdensudstilling.","Jeg bliver op til ca. 15 cm højere, når det er varmt.","Jeg er cirka 330 meter høj.","Jeg står i Paris."]},
{a:"Honningbi",c:["Jeg har fem øjne.","Jeg danser for at fortælle, hvor maden er.","Jeg lever i en koloni med én dronning.","Jeg laver noget sødt, der næsten aldrig fordærves.","Jeg dør, når jeg har stukket."]},
{a:"Blæksprutte",c:["Jeg har tre hjerter.","Mit blod er blåt.","Jeg har otte arme, men ingen knogler.","Jeg kan sprøjte blæk.","Jeg kan presse mig gennem meget små sprækker."]},
{a:"Månen",c:["Jeg fjerner mig ca. 3,8 cm fra Jorden om året.","Jeg har ingen atmosfære.","Jeg påvirker tidevandet.","Tolv mennesker har gået på mig.","Jeg skifter fra nymåne til fuldmåne på ca. 15 dage."]},
{a:"Vombat",c:["Jeg kommer fra Australien.","Jeg er et pungdyr med en pung, der vender bagud.","Jeg graver store huler.","Jeg laver terningeformet afføring.","Jeg ligner en lille bamse med korte ben."]},
{a:"Chokolade",c:["Jeg kommer fra bønner.","Aztekerne drak mig bitter og krydret.","Jeg smelter ved ca. kropstemperatur.","Jeg stammer fra kakaotræet.","Hunde bør ikke spise mig."]},
{a:"Rødvin",c:["Jeg starter som frugt.","Jeg opbevares ofte i egetræsfade.","Min farve kommer fra druernes skaller.","Jeg skal gerne «ånde» i en karaffel.","Man siger skål, når man løfter mig."]},
{a:"Pizza",c:["Jeg er rund, men leveres ofte i en firkantet æske.","Jeg stammer fra Napoli.","Min mest berømte udgave er ifølge legenden opkaldt efter en dronning.","Jeg bages i en meget varm ovn.","Jeg har ofte tomat og mozzarella."]},
{a:"Pingvin",c:["Jeg er en fugl, men kan ikke flyve.","Jeg har knæ, der er skjult af fjer.","Jeg lever på den sydlige halvkugle.","Jeg svømmer fremragende.","Hannen af kejserarten ruger ægget på sine fødder."]},
{a:"Regnbue",c:["Jeg består af lys.","Jeg kræver sol og regn på samme tid.","Jeg er en cirkel, men du ser kun en bue.","Jeg har syv klassiske farver.","Man siger, der er en guldskat i min ende."]},
{a:"Kamel",c:["Jeg lever i ørkenen.","Jeg kan drikke over 100 liter på kort tid.","Min pukkel er fedt, ikke vand.","Jeg har to rækker øjenvipper.","Der findes arter med én eller to pukler."]},
{a:"Titanic",c:["Jeg var verdens største skib.","Jeg sejlede første gang i 1912.","Jeg ramte et isbjerg.","Jeg gik ned i Nordatlanten.","Mange kender mig fra en film med Leonardo DiCaprio."]},
{a:"Tivoli",c:["Jeg ligger midt i en hovedstad.","Jeg åbnede i 1843.","Jeg har en gammel rutsjebane i træ.","Jeg er farverig og lys om natten.","Jeg ligger ved Hovedbanegården i København."]},
{a:"Den Lille Havfrue",c:["Jeg sidder på en sten.","Jeg blev afsløret i 1913.","Jeg er lavet af bronze og granit.","Jeg er inspireret af et eventyr af H.C. Andersen.","Jeg er mindre, end de fleste forventer."]},
{a:"Kaffe",c:["Jeg starter som røde bær.","Legenden siger, at en etiopisk gedehyrde opdagede mig.","Jeg indeholder koffein.","Jeg males, inden jeg brygges.","Danskerne drikker mig i store mængder."]},
{a:"Havesnegl",c:["Jeg bærer mit hjem på ryggen.","Jeg har tusindvis af tænder.","Jeg bevæger mig på én enkelt fod.","Jeg kan sove i flere år.","Jeg elsker regnvejr."]},
{a:"Mount Everest",c:["Jeg bliver ca. 4 mm højere om året.","Jeg ligger i Himalaya.","Jeg er det højeste bjerg over havets overflade.","Jeg er ca. 8.849 meter høj.","Edmund Hillary og Tenzing Norgay besteg mig først."]},
{a:"Legoklods",c:["Jeg er lavet af plastik.","Jeg blev opfundet i Danmark.","Jeg har knopper på toppen.","Det gør ondt at træde på mig.","Mit navn kommer af «leg godt»."]},
{a:"Elefant",c:["Jeg er verdens største landdyr.","Jeg er drægtig i 22 måneder.","Jeg kan ikke hoppe.","Jeg har store ører, der køler mig ned.","Jeg har en snabel."]},
{a:"Haj",c:["Jeg har ingen knogler.","Jeg er ældre end træerne.","Mine tænder bliver udskiftet hele livet.","Mit skelet er lavet af brusk.","Jeg lugter blod på lang afstand."]}
],
// Forbudte ord: w = ordet, f = forbudte ord
taboo:[
{w:"Vin",f:["drue","rød","glas"]},{w:"Kaffe",f:["kop","bønner","koffein"]},{w:"Elefant",f:["snabel","grå","stor"]},
{w:"Fødselsdag",f:["kage","gave","år"]},{w:"Pizza",f:["ost","Italien","rund"]},{w:"Bil",f:["køre","hjul","motor"]},
{w:"Sne",f:["kold","vinter","hvid"]},{w:"Cykel",f:["hjul","pedal","styr"]},{w:"Tandbørste",f:["mund","pasta","rense"]},
{w:"Paraply",f:["regn","våd","åbne"]},{w:"Kuffert",f:["rejse","tøj","pakke"]},{w:"Brandbil",f:["ild","slukke","rød"]},
{w:"Pirat",f:["hav","øjenklap","skat"]},{w:"Julemand",f:["jul","gaver","skæg"]},{w:"Biograf",f:["film","popcorn","lærred"]},
{w:"Fodbold",f:["mål","banen","sparke"]},{w:"Chokolade",f:["sød","brun","kakao"]},{w:"Computer",f:["skærm","tastatur","internet"]},
{w:"Telefon",f:["ringe","mobil","tale"]},{w:"Hund",f:["gø","kæledyr","pote"]},{w:"Kat",f:["mjav","kæledyr","spinde"]},
{w:"Cirkus",f:["klovn","telt","løve"]},{w:"Regnbue",f:["farver","regn","sol"]},{w:"Spøgelse",f:["bøh","hvidt","uhyggelig"]},
{w:"Strand",f:["sand","hav","sol"]},{w:"Svømmehal",f:["vand","bade","klor"]},{w:"Bageri",f:["brød","rundstykker","morgen"]},
{w:"Rutsjebane",f:["tivoli","hurtig","kørsel"]},{w:"Vulkan",f:["lava","udbrud","bjerg"]},{w:"Astronaut",f:["rummet","raket","måne"]},
{w:"Bryllup",f:["brud","gift","ring"]},{w:"Krone",f:["konge","dronning","guld"]}
],
// Gæt og vis (pantomime)
char:[
"(Let) En kat der jager en mus","(Let) En pingvin på glat is","(Let) Bage en kage","(Let) Børste tænder","(Let) Skøjteløb",
"(Let) En abe i zoo","(Let) Rejse sig fra sofaen efter fire timer","(Let) Spille guitar","(Let) Sove som en bjørn","(Let) Kaste en bowlingkugle",
"(Mellem) Fange en fisk, der slipper væk","(Mellem) Krybe gennem et laserfelt","(Mellem) Parkere en lastbil baglæns","(Mellem) Lave en pizza og kaste den højt i luften","(Mellem) Sælge en brugt bil",
"(Mellem) Tage en selfie med en haj","(Mellem) Holde brudetale","(Mellem) Møde en bjørn i skoven","(Mellem) Skifte ble på en kæmpebaby","(Mellem) Surfe på en kæmpebølge",
"(Svær) Overbevise en tyr om ikke at angribe","(Svær) Hente posten i en orkan","(Svær) Spise spaghetti, der bliver ved med at vokse","(Svær) Eftermiddagste hos dronningen","(Svær) Dirigere et orkester af katte",
"(Svær) Servere vin til en vampyr","(Svær) Bage en kage med bind for øjnene","(Svær) Prøve at få en kamel gennem et nåleøje","(Svær) Være en vejrmand i en tornado","(Svær) Overtale en snegl til at skynde sig",
"(Film) Titanic – «jeg flyver!»","(Film) Hajen (Jaws)","(Film) Kung Fu Panda","(Film) Ghostbusters","(Film) Fiskerne i Nemo",
"(Dyr) Giraf, der drikker vand","(Dyr) Flodhest i gyngestol","(Dyr) Chamæleon der skifter farve","(Dyr) Pave-fasan der strutter","(Dyr) Kænguru på løbebånd"
],
// Dybe spørgsmål – date night og familieaften
deep:[
"Hvad er det bedste minde, vi har sammen?","Hvilken lille ting får dig altid til at smile?","Hvis du kunne rejse hvor som helst i morgen – hvor så?","Hvad er du mest taknemmelig for lige nu?","Hvad var dit livs bedste dag indtil nu?",
"Hvilken drøm har du aldrig fortalt nogen?","Hvad ville du lave, hvis penge ikke var et problem?","Hvilken tradition vil du helst give videre?","Hvad er du stolt af, som du sjældent fortæller om?","Hvad er det bedste råd, du nogensinde har fået?",
"Hvem har haft størst betydning for dig, og hvorfor?","Hvad ville du gøre anderledes, hvis du kunne starte forfra i dit 20'er-liv?","Hvilken ny ting vil du prøve i år?","Hvad er din yndlingsfamilietradition?","Hvilken lugt minder dig om din barndom?",
"Hvad er det mest spontane, du nogensinde har gjort?","Hvilken superkraft ville du vælge til hverdagen – og hvorfor?","Hvad er dit største ønske for vores fremtid?","Hvad er det mest modige, du har gjort?","Hvad får dig til at føle dig mest elsket?",
"Hvis dit liv var en film, hvad ville titlen være?","Hvilken sang beskriver dit liv lige nu?","Hvad er din yndlingsting ved mig/jer?","Hvad savner du fra din barndom?","Hvilken fejl lærte du mest af?",
"Hvad er en lille ting, jeg gør, som du sætter stor pris på?","Hvis vi skulle bygge et drømmehus, hvad skulle det absolut have?","Hvad er det fedeste sted, du nogensinde har sovet?","Hvilken fremmed, du har mødt, husker du stadig?","Hvis du kunne spise middag med hvem som helst, levende eller død – hvem?"
],
// Hvad skete først? a = to begivenheder, c = index på den, der skete først
tl:[
{q:"Hvad skete først?",a:["Oxford Universitet begyndte at undervise (ca. 1096)","Aztekernes by Tenochtitlan blev grundlagt (1325)"],c:0,e:"Oxford er ældre end Aztekerriget."},
{q:"Hvad skete først?",a:["Ørsted opdagede elektromagnetismen (1820)","Den første danske jernbane åbnede (1847)"],c:0,e:""},
{q:"Hvad skete først?",a:["Dannebrog faldt ned fra himlen ifølge sagnet (1219)","Marco Polo kom til Kina (1275)"],c:0,e:""},
{q:"Hvad skete først?",a:["Marie Curie fik sin første Nobelpris (1903)","Titanic sank (1912)"],c:0,e:""},
{q:"Hvad skete først?",a:["Legos nuværende klodse-patent (1958)","Første menneske i rummet (1961)"],c:0,e:""},
{q:"Hvad skete først?",a:["Tivoli åbnede (1843)","Danmarks første frimærke (1851)"],c:0,e:""},
{q:"Hvad skete først?",a:["Wikipedia blev lanceret (2001)","Euromønter kom i omløb (2002)"],c:0,e:""},
{q:"Hvad skete først?",a:["Facebook blev grundlagt (2004)","Den første iPhone blev solgt (2007)"],c:0,e:""},
{q:"Hvad skete først?",a:["De første moderne olympiske lege (1896)","Den første Tour de France (1903)"],c:0,e:""},
{q:"Hvad skete først?",a:["Månelandingen (1969)","Den første Star Wars-film (1977)"],c:0,e:""},
{q:"Hvad skete først?",a:["Napoleon blev kejser (1804)","USA's uafhængighedserklæring (1776)"],c:1,e:""},
{q:"Hvad skete først?",a:["Cheops-pyramiden blev færdigbygget (ca. 2560 f.Kr.)","De sidste uldhåret mammutter døde (ca. 2000 f.Kr.)"],c:0,e:"Mammutterne levede altså stadig, da pyramiderne var bygget."},
{q:"Hvad skete først?",a:["Den første e-mail blev sendt (1971)","Den første mobiltelefon-samtale (1973)"],c:0,e:""},
{q:"Hvad skete først?",a:["Kleopatra døde (30 f.Kr.)","Cheops-pyramiden var 2.500 år gammel"],c:0,e:"Kleopatra levede ca. 2.500 år efter pyramidens opførelse – og tættere på månelandingen end på pyramidens bygning."}
]
});
