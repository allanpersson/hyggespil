/* Geografi & ord – puljer. Nye elementer tilføjes i bunden; daglige tilføjelser ligger i extra.json */
(function(){
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const others=(arr,not,n)=>shuf(arr.filter(x=>x!==not)).slice(0,n);
// By -> land: [by, rigtigt land, [3 forkerte]]
DATA.city=[
["Timbuktu","Mali",["Niger","Mauretanien","Senegal"]],["Ouagadougou","Burkina Faso",["Mali","Niger","Ghana"]],["Ulaanbaatar","Mongoliet",["Kasakhstan","Kina","Kirgisistan"]],
["Ushuaia","Argentina",["Chile","Uruguay","Falklandsøerne"]],["Tórshavn","Færøerne",["Island","Norge","Skotland"]],["Vaduz","Liechtenstein",["Schweiz","Østrig","Luxembourg"]],
["Valletta","Malta",["Cypern","Italien","Grækenland"]],["Tbilisi","Georgien",["Armenien","Aserbajdsjan","Tyrkiet"]],["Yerevan","Armenien",["Georgien","Iran","Tyrkiet"]],
["Baku","Aserbajdsjan",["Turkmenistan","Georgien","Iran"]],["Bishkek","Kirgisistan",["Kasakhstan","Usbekistan","Tadsjikistan"]],["Dushanbe","Tadsjikistan",["Kirgisistan","Turkmenistan","Afghanistan"]],
["Asunción","Paraguay",["Bolivia","Uruguay","Colombia"]],["Quito","Ecuador",["Peru","Colombia","Bolivia"]],["Paramaribo","Surinam",["Guyana","Fransk Guyana","Venezuela"]],
["Antananarivo","Madagaskar",["Mauritius","Mozambique","Tanzania"]],["Windhoek","Namibia",["Botswana","Zambia","Sydafrika"]],["Lilongwe","Malawi",["Zambia","Mozambique","Tanzania"]],
["Kampala","Uganda",["Kenya","Rwanda","Tanzania"]],["Asmara","Eritrea",["Etiopien","Sudan","Djibouti"]],["Vientiane","Laos",["Vietnam","Thailand","Cambodja"]],
["Phnom Penh","Cambodja",["Thailand","Laos","Vietnam"]],["Thimphu","Bhutan",["Nepal","Myanmar","Bangladesh"]],["Muscat","Oman",["Yemen","Forenede Arabiske Emirater","Qatar"]],
["Amman","Jordan",["Syrien","Libanon","Irak"]],["Chișinău","Moldova",["Rumænien","Ukraine","Hviderusland"]],["Tallinn","Estland",["Letland","Finland","Litauen"]],
["Vilnius","Litauen",["Letland","Polen","Estland"]],["Ljubljana","Slovenien",["Kroatien","Slovakiet","Østrig"]],["Skopje","Nordmakedonien",["Albanien","Serbien","Bulgarien"]],
["Tirana","Albanien",["Montenegro","Kosovo","Grækenland"]],["Podgorica","Montenegro",["Serbien","Bosnien-Hercegovina","Kroatien"]],["Tromsø","Norge",["Sverige","Finland","Island"]],
["Hobart","Australien",["New Zealand","Sydafrika","Fiji"]],["Punta Arenas","Chile",["Argentina","Uruguay","Peru"]],["Samarkand","Usbekistan",["Tadsjikistan","Kasakhstan","Turkmenistan"]],
["Lhasa","Kina",["Nepal","Bhutan","Indien"]],["Longyearbyen","Norge",["Rusland","Grønland","Island"]],["Bratislava","Slovakiet",["Tjekkiet","Ungarn","Polen"]],
["Kigali","Rwanda",["Burundi","Uganda","Tanzania"]],["Suva","Fiji",["Vanuatu","Samoa","Tonga"]],["Nuuk","Grønland",["Island","Canada","Færøerne"]]
].map(([c,r,w])=>({q:"I hvilket land ligger "+c+"?",o:[r].concat(w),a:0}));
// Knappenål: [land, breddegrad, længdegrad] (omtrentligt midtpunkt)
DATA.geo=[
["Bhutan",27.5,90.4],["Malta",35.9,14.4],["Mongoliet",46.9,103.8],["Madagaskar",-18.8,46.9],["Island",64.9,-18.6],["Surinam",4.0,-56.0],["Eritrea",15.2,39.8],
["Kirgisistan",41.2,74.8],["Laos",19.9,102.5],["Moldova",47.4,28.4],["Namibia",-22.0,17.1],["Paraguay",-23.4,-58.4],["Slovenien",46.1,14.8],["Vanuatu",-16.0,167.0],
["Tadsjikistan",38.9,71.3],["Uruguay",-32.8,-56.0],["Estland",58.7,25.5],["Cuba",21.5,-80.0],["Sri Lanka",7.9,80.7],["Oman",21.5,55.9],["Benin",9.3,2.3],
["Malawi",-13.2,34.3],["Georgien",42.3,43.4],["Albanien",41.1,20.2],["Bolivia",-16.7,-64.7],["Jordan",31.2,36.5],["Nepal",28.4,84.1],["Papua Ny Guinea",-6.3,143.9],
["Fiji",-17.7,178.0],["Luxembourg",49.8,6.1],["Costa Rica",9.7,-84.2],["Kasakhstan",48.0,67.0],["Ghana",7.9,-1.0],["Tunesien",33.9,9.5],["Peru",-9.2,-75.0],
["Bulgarien",42.7,25.5],["Cambodja",12.6,104.9],["Uganda",1.4,32.3],["Slovakiet",48.7,19.7],["Libanon",33.9,35.9],["Armenien",40.1,45.0],["Aserbajdsjan",40.4,47.7],
["Turkmenistan",39.0,59.6],["Botswana",-22.3,24.7],["Zambia",-13.1,27.8],["Panama",8.5,-80.8],["Marokko",31.8,-7.1],["Chile",-35.7,-71.5],["Nigeria",9.1,8.7],
["Thailand",15.9,101.0],["Kenya",0.0,38.0],["Irak",33.0,44.0],["Syrien",35.0,38.5]
].map(([c,la,lo])=>({c,la,lo}));
// Postnummer -> by
const ZIP=[["1000","København K"],["2000","Frederiksberg"],["2800","Kongens Lyngby"],["2900","Hellerup"],["3000","Helsingør"],["3400","Hillerød"],["3600","Frederikssund"],["3700","Rønne"],
["4000","Roskilde"],["4100","Ringsted"],["4200","Slagelse"],["4300","Holbæk"],["4400","Kalundborg"],["4600","Køge"],["4700","Næstved"],["4760","Vordingborg"],["4800","Nykøbing Falster"],["4900","Nakskov"],
["5000","Odense C"],["5500","Middelfart"],["5600","Faaborg"],["5700","Svendborg"],["5800","Nyborg"],["6000","Kolding"],["6200","Aabenraa"],["6270","Tønder"],["6400","Sønderborg"],["6700","Esbjerg"],
["6760","Ribe"],["6800","Varde"],["6900","Skjern"],["6950","Ringkøbing"],["7000","Fredericia"],["7100","Vejle"],["7400","Herning"],["7500","Holstebro"],["7700","Thisted"],["7800","Skive"],
["8000","Aarhus C"],["8300","Odder"],["8382","Hinnerup"],["8500","Grenaa"],["8600","Silkeborg"],["8660","Skanderborg"],["8700","Horsens"],["8800","Viborg"],["8900","Randers C"],
["9000","Aalborg"],["9500","Hobro"],["9600","Aars"],["9800","Hjørring"],["9900","Frederikshavn"],["9990","Skagen"]];
const towns=ZIP.map(z=>z[1]);
DATA.zip=ZIP.map(([z,t])=>({q:"Hvilken by hører postnummer "+z+" til?",o:[t].concat(others(towns,t,3)),a:0}));
// Mærkelige ord: [ord, sprog, rigtig betydning, [3 forkerte]]
DATA.weird=[
["Fedtmule","dansk","En klodset og uheldig person",["En grådig spiser","En type vante","En sur, indebrændt person"]],
["Hullumhej","dansk","Munter larm og postyr",["Et hul i en tønde","En gammel dans","Et kort uvejr"]],
["Kæphest","dansk","Et yndlingsemne, man hele tiden vender tilbage til",["En gammel spadserestok","En trodsig hest","Et hestespil for børn"]],
["Tølper","dansk","En klodset eller uopdragen person",["En slags lille fugl","En gammel pengesum","En frodig tidsel"]],
["Dagdriver","dansk","En, der driver dagene hen uden at lave noget",["En bonde med mange køer","En sjælden sommerfugl","En lastbilchauffør"]],
["Spilopper","dansk","Drillerier eller gale streger",["Små kortspil","Åbninger i en teaterscene","Gamle musikinstrumenter"]],
["Pjat","dansk","Sludder",["Et stykke tøj","En lille pyt","En hurtig løbetur"]],
["Defenestration","engelsk","At smide nogen ud af et vindue",["At fjerne al væge fra et lys","At fyre en hel afdeling","At male et vindue"]],
["Petrichor","engelsk","Duften af regn på tør jord",["Et sjældent stenmineral","En frygt for klipper","En gammel kirkeklokke"]],
["Borborygmus","engelsk","Knurren i maven",["En sjælden hudsygdom","En græsk rustning","Et stort kor"]],
["Susurrus","engelsk","Hvisken eller sagte raslen",["En skarp smerte","En sydlig vind","Et lille slags frø"]],
["Snollygoster","engelsk","En snu, principløs person (især en politiker)",["En sød, klistret slik","En sjælden slange","En gammel galoche"]],
["Absquatulate","engelsk","At forsvinde brat",["At tælle noget forkert","At sidde på hug","At sove længe"]],
["Callipygian","engelsk","Med smukke balder",["Meget flot skrift","Behændig med kalligrafi","Vellydende"]],
["Floccinaucinihilipilification","engelsk","Vanen at vurdere noget som værdiløst",["En frygt for lange ord","En sygdom i halsen","En form for snedkerarbejde"]],
["Crepuscular","engelsk","Aktiv i tusmørket",["Meget knasende","Bange for edderkopper","Lavet af mel"]],
["Mellifluous","engelsk","Sødt og flydende at høre på",["Fyldt med honning","Meget klistret","Dårligt kogt"]],
["Kerfuffle","engelsk","Postyr eller virvar",["En blød legetøjsdyne","En lille kjole","Et sjovt hovedtøj"]],
["Lollygag","engelsk","At spilde tiden og drive rundt",["At sælge slik","At grine uden grund","At hoppe på ét ben"]],
["Discombobulated","engelsk","Forvirret og rystet",["Fuldstændig afkølet","Flået fra hinanden","Ikke forbundet til nettet"]],
["Gobbledygook","engelsk","Uforståeligt sprøjt",["En type kalkun","Et populært legetøj","En gammel gryderet"]],
["Pandiculation","engelsk","At strække sig og gabe",["En sygdom hos pandaer","At sælge pander","En dans fra Rusland"]],
["Ultracrepidarian","engelsk","En, der udtaler sig om ting, man ikke har forstand på",["En ekstrem langdistanceløber","En ekspert i tusmørke","En meget sulten person"]],
["Limerence","engelsk","Besat tilstand af forelskelse",["En slags citronkage","En gammel måleenhed","Frygten for rim"]],
["Widdershins","engelsk","Mod uret",["Med bøjede knæ","I vild fart","Med lukkede øjne"]],
["Cattywampus","engelsk","Skævt eller på tværs",["Som en klog kat","Fuld af uld","Pudsigt kattemad"]],
["Hullabaloo","engelsk","Ståhej og larm",["En hawaiiansk dans","En stor, blød bold","En type bænk"]],
["Quockerwodger","engelsk","En dukke på snore – også om en politiker styret af andre",["En træ-ske","En sjælden fugl","En type kiks"]],
["Smellfungus","engelsk","En evig brokkehoved",["En stinkende svamp","En kok med dårlig næse","En type blå ost"]]
].map(([w,l,r,x])=>({q:"Hvad betyder «"+w+"» ("+l+")?",o:[r].concat(x),a:0}));
// Hvilket sprog? [ord, sprog, betydning]
const LANGS=["Tysk","Hollandsk","Svensk","Norsk","Finsk","Japansk","Russisk","Portugisisk","Spansk","Italiensk","Walisisk","Indonesisk","Tagalog","Zulu","Fransk","Polsk","Ungarsk","Koreansk","Swahili","Tyrkisk","Græsk","Hindi"];
DATA.lang=[
["Backpfeifengesicht","Tysk","Et ansigt, der trænger til en lussing"],["Kummerspeck","Tysk","Vægtøgning fra at trøstespise"],["Torschlusspanik","Tysk","Frygten for at miste sine chancer, når tiden går"],
["Waldeinsamkeit","Tysk","Følelsen af ensomhed i skoven"],["Fernweh","Tysk","Længsel efter fjerne steder"],["Drachenfutter","Tysk","En gave, man giver for at formilde nogen"],
["Saudade","Portugisisk","Vemodigt savn efter noget fraværende"],["Cafuné","Portugisisk","At kærtegne nogens hår"],["Hiraeth","Walisisk","Dyb længsel efter et hjem, man ikke kan vende tilbage til"],
["Jayus","Indonesisk","En vittighed, så dårlig, at den bliver sjov"],["Pochemuchka","Russisk","En person, der altid stiller spørgsmål"],["Razbliuto","Russisk","Følelsen for en, man engang har elsket"],
["Tsundoku","Japansk","At købe bøger og lade dem stå ulæste"],["Komorebi","Japansk","Sollys, der siver gennem bladene"],["Ikigai","Japansk","Det, man lever for / årsagen til at stå op"],
["Forelsket","Norsk","Den første rus af forelskelse"],["Utepils","Norsk","En øl nydt udendørs i solen"],["Gigil","Tagalog","Trangen til at klemme noget, der er for sødt"],
["Kilig","Tagalog","Sommerfugle i maven"],["Culaccino","Italiensk","Ringen, et koldt glas efterlader på bordet"],["Sisu","Finsk","Sej vedholdenhed, også når det ser umuligt ud"],
["Lagom","Svensk","Netop tilpas – hverken for meget eller for lidt"],["Gökotta","Svensk","At stå tidligt op for at høre fuglesang"],["Sobremesa","Spansk","Tiden efter måltidet, hvor man bliver siddende og snakker"],
["Voorpret","Hollandsk","Forglæden – at glæde sig, før noget sker"],["Uitwaaien","Hollandsk","At gå tur i blæsten for at få rent hoved"],["Gezelligheid","Hollandsk","Hyggeligt samvær og stemning"],
["Iktsuarpok","Inuit","Spændt forventning – man går ud og kigger efter gæster"],["Mamihlapinatapai","Yaghan","Et blik mellem to, som begge ønsker noget, men ingen tør sige det"],
["Ubuntu","Zulu","«Jeg er, fordi vi er» – menneskelighed over for andre"]
].map(([w,l,m])=>({q:"Hvilket sprog stammer «"+w+"» fra?",o:[l].concat(others(LANGS.concat(["Inuit","Yaghan"]),l,3)),a:0,e:"«"+w+"»: "+m+" ("+l+")"}));
})();
