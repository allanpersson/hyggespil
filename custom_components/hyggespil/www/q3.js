/* Danske love og regler – hvert faktum er kontrolleret mod retsinformation.dk, lex.dk/danmarkshistorien.lex.dk, Fødevarestyrelsen, politi.dk, Folketinget m.fl. Gældende regler: ingen årstal i spørgsmålet. Historiske: (start-slut). Format: [spørgsmål, RIGTIGT svar, forkert1, forkert2, forkert3, forklaring] */
(function(){
const R=[
/* ---- gældende regler ---- */
[`Kan man i dag blive straffet for spirituskørsel, selvom man har under 0,5 promille?`,`Ja – hvis man er så påvirket, at man ikke kan føre køretøjet på betryggende måde`,`Nej – under 0,5 promille er det altid lovligt`,`Kun hvis man har haft en ulykke`,`Kun hvis man er erhvervschauffør`,`Færdselsloven § 53: Straffen gælder ved over 0,50 promille, men også ved mindre, hvis man ikke kan føre køretøjet på betryggende måde.`],
[`Hvilken promillegrænse gælder i dag for en bilist, der har haft kørekort til almindelig bil i under 3 år?`,`0,20 promille`,`0,10 promille`,`0,30 promille`,`0,50 promille`,`Færdselsloven § 53, stk. 2: 0,20 promille (0,10 mg pr. liter udråndingsluft) de første 3 år.`],
[`Hvad er den almindelige grænse for spirituskørsel målt i udråndingsluft i dag?`,`Over 0,25 mg pr. liter luft`,`Over 0,10 mg pr. liter luft`,`Over 0,50 mg pr. liter luft`,`Over 0,15 mg pr. liter luft`,`Svarer til 0,50 promille i blodet (Færdselsloven § 53, stk. 1).`],
[`Hvad er den almindelige hastighedsgrænse på en motortrafikvej, hvis ikke andet er skiltet?`,`80 km/t`,`90 km/t`,`100 km/t`,`70 km/t`,`Færdselsloven § 42, stk. 3. På motorvej er den 130 km/t.`],
[`Hvad er den almindelige hastighedsgrænse uden for tættere bebygget område, hvis ikke andet er skiltet?`,`80 km/t`,`70 km/t`,`90 km/t`,`100 km/t`,`I tættere bebygget område er den 50 km/t (Færdselsloven § 42).`],
[`Hvad er den kriminelle lavalder i Danmark i dag?`,`15 år`,`14 år`,`16 år`,`12 år`,`Straffeloven § 15: Handlinger foretaget af børn under 15 år straffes ikke.`],
[`Er det i sig selv strafbart at flygte fra et fængsel i Danmark?`,`Ja – bøde eller fængsel indtil 2 år`,`Nej – kun hjælp til flugten er strafbar`,`Ja – bøde eller fængsel indtil 1 år`,`Ja – fængsel indtil 4 år`,`Straffeloven § 124, stk. 1. Samme straf gælder for den, der hjælper til flugten (stk. 2).`],
[`Hvor mange procent af alle stemmeberettigede skal mindst stemme ja, for at en ændring af Grundloven bliver vedtaget ved folkeafstemning?`,`40 procent`,`25 procent`,`50 procent`,`60 procent`,`Grundlovens § 88: Flertallet skal udgøre mindst 40 % af alle stemmeberettigede.`],
[`Er der skolepligt i Danmark?`,`Nej – der er undervisningspligt, og undervisningen kan foregå hjemme`,`Ja – alle børn skal gå i folkeskole`,`Ja – men kun til og med 7. klasse`,`Nej – skolegang er helt frivillig`,`Grundlovens § 76: Børn har undervisningspligt, men der er ingen pligt til at gå i folkeskole. Undervisningen kan også foregå hjemme eller på en privatskole.`],
[`Er det lovpligtigt at bruge cykelhjelm som voksen cyklist i Danmark?`,`Nej – det er kun anbefalet`,`Ja – på alle veje`,`Ja – kun i byerne`,`Ja – kun når det er mørkt`,`Der er ingen lovkrav om cykelhjelm. Hjelmpåbud gælder bl.a. knallert og el-løbehjul.`],
[`Hvor mange hunderacer er forbudt at holde i Danmark?`,`13 racer`,`7 racer`,`10 racer`,`20 racer`,`Forbuddet omfatter også krydsninger, og pitbull terrier er med. Det er forbudt at holde, avle og indføre dem, og der kan ikke søges om dispensation.`],
[`Hvad gælder i Danmark for et fornavn, der ikke står på listen over godkendte navne?`,`Man skal søge om at få det godkendt`,`Det kan frit bruges`,`Det er altid forbudt`,`Det kan bruges, hvis det har under 12 bogstaver`,`Et godkendt navn kommer på listen og kan bagefter bruges frit af alle (Familieretshuset).`],
[`Hvornår trådte forbuddet mod ansigtsdækkende beklædning på offentlige steder i kraft?`,`1. august 2018`,`1. januar 2010`,`1. august 2014`,`1. januar 2022`,`Det såkaldte tækningsforbud blev indført i straffeloven og håndhæves af politiet.`],
[`Hvilken dato trådte loven om røgfri miljøer (rygeloven) i kraft?`,`15. august 2007`,`1. januar 2007`,`1. juli 2008`,`1. august 2005`,`Den gjaldt bl.a. for arbejdspladser, serveringssteder, offentlige indendørs lokaliteter, taxaer og kollektiv trafik.`],
[`Hvilket land var det første i verden til at vedtage en lov, der begrænser industrielt fremstillede transfedtsyrer i fødevarer?`,`Danmark`,`Sverige`,`USA`,`Tyskland`,`Fødevarestyrelsen: Danmark var det første land i verden med en sådan lov.`],
[`Er en mundtlig aftale juridisk bindende i Danmark?`,`Ja – og det gælder stadig efter en regel fra Danske Lov af 1683`,`Nej – kun skriftlige aftaler er bindende`,`Kun hvis to vidner har været til stede`,`Kun hvis den er indgået foran en notar`,`Danske Lov 5-1-1 fra 1683 gælder stadig: Både mundtlige og skriftlige aftaler er bindende.`],
[`Hvilket eksempel på en regel fra Danske Lov af 1683 gælder stadig i dag?`,`Arbejdsgiverens ansvar for ansattes handlinger i arbejdet`,`Pligten til at gå i kirke`,`Forbuddet mod at arbejde i kirketiden`,`Stavnsbåndet`,`Lex.dk: Husbondansvaret lever videre som arbejdsgiveransvaret (Danske Lov 3-19-2).`],
/* ---- historiske regler og love ---- */
[`Hvilken afgift på mere end 2,3 % mættet fedt i fødevarer gjaldt fra oktober 2011 til 1. januar 2013?`,`Fedtafgiften`,`Sukkerafgiften`,`Saltafgiften`,`Kalorieafgiften`,`Fedtafgiften (2011-2012) var 16 kr. pr. kg mættet fedt. Fødevarer med højst 2,3 % var undtaget.`],
[`Hvor høj var fedtafgiften (2011-2012) pr. kilo mættet fedt?`,`16 kr.`,`8 kr.`,`24 kr.`,`32 kr.`,`Fødevarer med et indhold på højst 2,3 % mættet fedt var undtaget.`],
[`Hvor mange personer måtte højst deltage i et bondebryllup efter forordningen af 1783 (gældende til 1799)?`,`32 personer`,`20 personer`,`50 personer`,`100 personer`,`Forordning om Overdaadigheds Indskrænkning i Bondestanden, 12. marts 1783, ophævet 1799. For hver ekstra person skulle brudeparret betale 2 mark.`],
[`Hvor mange retter måtte der højst serveres ved et bondebryllup efter forordningen af 1783 (gældende til 1799)?`,`4 retter`,`2 retter`,`6 retter`,`8 retter`,`Samtidig var vin og kaffe forbudt.`],
[`Hvilke drikkevarer var forbudt at servere ved bondebryllupper efter forordningen af 1783 (gældende til 1799)?`,`Vin og kaffe`,`Øl og brændevin`,`Te og kakao`,`Mjød og æblemost`,`Kaffedrikning blandt almuen på landet var generelt forbudt. Bøde for overtrædelse ved bryllup: 8 skilling pr. person.`],
[`Hvor lang tid måtte et bondebryllup vare efter forordningen af 1783 (gældende til 1799)?`,`Én dag (dog måtte 16 gæster komme dagen efter kl. 18 og danse til midnat)`,`To dage`,`Tre dage`,`En hel uge`,`Ved længere varighed var bøden 2-20 rigsdaler pr. ekstra dag.`],
[`Hvilket stykke silketøj måtte bondekvinder have på efter forordningen af 1783 (gældende til 1799)?`,`En silkehue`,`En silkekjole`,`Et silketørklæde`,`Et silkeskørt`,`Bønder skulle ellers bære hjemmelavet støf som vadmel. Bøde for overtrædelse: 16 skilling.`],
[`Hvilken straf ramte en bonde ved tredje overtrædelse af klædereglerne i forordningen af 1783 (gældende til 1799)?`,`Han skulle gå sidst til offergang`,`Han mistede sin gård`,`Han blev idoms ris`,`Han blev udvist af sognet`,`Selve bøden var 16 skilling pr. overtrædelse.`],
[`Hvad kostede det i bøde at servere vin eller kaffe ved barsel, dåb eller begravelse efter forordningen af 1783 (gældende til 1799)?`,`1 rigsdaler pr. gang`,`8 skilling pr. gang`,`10 rigsdaler pr. gang`,`1 mark pr. gang`,`Der måtte kun serveres mad til udenbys gæster.`],
[`Hvad var konfirmationen i perioden 1736-1909?`,`Tvungen`,`Forbudt`,`Frivillig`,`Kun for adelen`,`Konfirmationsforordningen af 13. januar 1736 gjorde den obligatorisk. Tvangen blev ophævet i 1909.`],
[`Hvad kunne man ikke, hvis man ikke var konfirmeret i perioden 1736-1909?`,`Gifte sig`,`Blive døbt`,`Betale skat`,`Blive begravet`,`Ukonfirmerede kunne heller ikke få næringsbevis som håndværker og kunne straffes, hvis de ikke var konfirmeret som 19-årige.`],
[`Hvilket år blev tvangen til konfirmation ophævet?`,`1909`,`1849`,`1899`,`1915`,`Konfirmationen blev indført som tvang i 1736.`],
[`Hvilket år blev konfirmationen indført som tvang?`,`1736`,`1683`,`1730`,`1788`,`Christian VI's forordning af 13. januar 1736.`],
[`Hvornår blev pligten til at gå i kirke formelt ophævet?`,`1845`,`1814`,`1849`,`1903`,`Pligten fandtes siden Danske Lov 1683, men blev i praksis sjældent håndhævet.`],
[`Hvad blev brugt mod dem, der ikke kunne betale bøden for udeblivelse fra kirken efter Frederik IV's sabbatsforordning (1730-1731)?`,`Gabestokken`,`Fæstningsarbejde`,`Landsforvisning`,`Piskning på torvet`,`Forordningen blev ophævet af Christian VI i 1731 og afløst af en mildere i 1735.`],
[`Hvilket år blev den første lukkelov vedtaget, som forbyder butikker at holde åbent på søn- og helligdage?`,`1904`,`1883`,`1922`,`1949`,`Loven skulle beskytte butikspersonalets fritid og blev revideret i 1908, 1922 og 1936.`],
[`Hvad var straffen for større tyveri efter Danske Lov af 1683 (gældende til 1866)?`,`Kagstrygning og brandmærkning`,`Fem års fængsel`,`Kun en bøde`,`Landsforvisning`,`Mindre tyveri blev straffet med piskning.`],
[`Hvilken straf gjaldt for trolddom i Danske Lov af 1683 (gældende til 1866)?`,`Bålbrand`,`Halshugning`,`Gabestok`,`Landsforvisning`,`Danske Lovs sjette bog byggede på Moseloven og De Ti Bud.`],
[`Hvilket år blev den sidste henrettelse i fredstid gennemført i Danmark?`,`1892`,`1866`,`1910`,`1930`,`Efter Straffeloven af 1866 blev der kun fuldbyrdet fire henrettelser.`],
[`Hvornår blev dødsstraffen genindført ved et straffelovstillæg til brug i retsopgøret efter besudelsen?`,`1945`,`1940`,`1948`,`1950`,`Straffelovstillægget af 1. juni 1945. Dødsstraffen blev afskaffet i fredstid ved straffeloven af 1930 (i kraft 1933).`],
[`I hvilket år blev dødsstraffen afskaffet i den militære straffelovgivning?`,`1978`,`1930`,`1945`,`1964`,`Det skete som den sidste rest af dødsstraffen.`],
[`Hvilken straffelov var gældende i Danmark i perioden 1866-1933?`,`Straffeloven af 1866`,`Danske Lov`,`Straffeloven af 1930`,`Jyske Lov`,`Straffeloven af 1930 trådte i kraft i 1933 og afløste den.`],
[`Hvem havde den lovgivende magt i Danmark under enevælden (1660-1849)?`,`Kongen`,`Rigsrådet`,`Folketinget`,`Landstinget`,`Under Kongeloven af 1665 var kongen både lovgiver, regent og højeste dommer.`],
[`Hvilke unge mennesker bandt stavnsbåndet (1733-1788) til det gods, de var født på?`,`Unge mænd på landet (14-36 år)`,`Alle landsbyens indbyggere`,`Kun kvinder på landet`,`Alle håndværkere`,`Stavnsbåndet omfattede ikke kvinder. Det blev indført ved forordning 4. februar 1733 og ophævet ved loven af 20. juni 1788, men først helt afviklet i 1800.`],
[`Hvad hed Folketingets andet kammer i perioden 1849-1953?`,`Landstinget`,`Rigsrådet`,`Herredagen`,`Danehoffet`,`Landstinget blev oprettet med Junigrundloven i 1849 og afskaffet i 1953.`],
[`Hvilken ordning (1989-2012) gav par af samme køn næsten samme rettigheder som ægteskab?`,`Registreret partnerskab`,`Papirløst samliv`,`Kirkelig velsignelse`,`Samlivserklæring`,`Loven trådte i kraft 1. oktober 1989. Danmark var det første land med en sådan lov. I 2012 blev den afløst af kønsneutralt ægteskab.`],
[`Hvornår blev den højere seksuelle lavalder for homoseksuelle forhold ophævet i Danmark?`,`1976`,`1961`,`1989`,`1999`,`Lex.dk: Den højere lavalder blev først ophævet i 1976.`],
[`Hvad gjaldt for tronfølgen i Danmark i perioden 1953-2009?`,`Kvinder kunne kun arve tronen, hvis der ikke fandtes en mand inden for linjen`,`Kun mænd kunne arve tronen`,`Kongen valgte frit sin arving`,`Det ældste barn arvede uanset køn`,`Efter en folkeafstemning 7. juni 2009 blev arvefølgen kønsneutral.`],
[`Hvilken regel (til og med 1996) gav forældre ret til at give børn en lussing?`,`Revselsesretten`,`Opdragelsesloven`,`Forældreansvarsloven`,`Børneloven`,`Den sidste rest af forældres revselsesret blev afskaffet i 1997.`],
[`Hvilket år blev legemlig straf generelt afskaffet i skolevæsenet?`,`1967`,`1927`,`1978`,`1997`,`Det skete med det såkaldte «spanskrørscirkulære»: «Legemlig straf må ikke anvendes».`],
[`Hvilket år fik kvinder valgret og valgbarhed til de kommunale råd?`,`1908`,`1898`,`1915`,`1920`,`Kvinder og tyende fik kommunal valgret i 1908. Første kommunalvalg for kvinder var i 1909.`],
[`Hvornår fik kvinder valgret til Folketinget?`,`1915`,`1849`,`1908`,`1920`,`Ved grundlovsændringen 5. juni 1915 fik mænd og kvinder valgret på lige vilkår fra 25 år.`],
[`Hvad var valgretsalderen til Folketinget i perioden 1953-1961?`,`23 år`,`21 år`,`25 år`,`20 år`,`Alderen blev sænket til 23 år i 1953, 21 år i 1961, 20 år i 1971 og 18 år i 1978.`],
[`Hvornår blev valgretsalderen til Folketinget sænket til 18 år?`,`1978`,`1961`,`1971`,`1989`,`Før 1978 var den 20 år (fra 1971).`],
[`Hvilket år blev slaveriet afskaffet i Dansk Vestindien?`,`1848`,`1803`,`1792`,`1865`,`Et slaveoprev på Sankt Croix den 3. juli 1848 pressede generalguvernør Peter von Scholten til at erklære slaveriet for ophævet.`],
[`Hvilket år blev Grundloven første gang underskrevet, så enevælden ophørte?`,`1849`,`1814`,`1866`,`1915`,`Underskrevet 5. juni 1849 af Frederik VII.`],
[`Hvilket år blev almueskoleloven udstedt, som indførte skolepligt for alle børn fra 7 år?`,`1814`,`1788`,`1849`,`1899`,`Anordningen af 29. juli 1814: Skolepligt fra 7 år til konfirmationen. På landet foregik skolegang hver anden dag.`],
[`Hvornår blev ægteskab for par af samme køn muligt i Danmark?`,`2012`,`1989`,`1999`,`2015`,`Folketinget vedtog en ny ægteskabslov, der ligestillede homo- og heteroseksuelle parforhold.`],
[`Hvornår blev fri abort (indtil udløbet af 12. uge) indført i Danmark?`,`1. oktober 1973`,`1. oktober 1961`,`1. juli 1978`,`1. januar 1989`,`Loven blev vedtaget 24. maj 1973.`],
[`Hvilket år blev billedpornografi lovlig i Danmark, som det første land i verden?`,`1969`,`1967`,`1973`,`1978`,`Tekstpornografi blev tilladt 1967. Billedpornografi 1969 (i kraft 1. juli).`],
[`Fra hvilket år er Store Bededag ikke længere helligdag?`,`2024`,`1999`,`2012`,`2019`,`Vedtaget 28. februar 2023. Sidste Store Bededag var 5. maj 2023.`],
[`Hvilket år blev Danske Lov udstedt af Christian V?`,`1683`,`1241`,`1660`,`1849`,`Danske Lov blev udstedt 15. april 1683.`],
[`Hvilket år blev Jyske Lov vedtaget?`,`1241`,`1183`,`1683`,`1536`,`Jyske Lov gjaldt for Jylland og Fyn.`],
[`Hvilket år fik jøder i Danmark med «Det jødiske frihedsbrev» lige adgang til at ernære sig og stort set ligestilling?`,`1814`,`1788`,`1849`,`1915`,`Udstedt 29. marts 1814 under Frederik VI.`],
[`Hvilket år blev enevælden indført i Danmark?`,`1660`,`1536`,`1665`,`1849`,`Fastlagt i Kongeloven af 1665.`]
];
DATA.law=(DATA.law||[]).concat(R.map(r=>({q:r[0],o:[r[1],r[2],r[3],r[4]],a:0,e:r[5]})));
const CS=['#ff5d8f','#ffb703','#2ec4b6','#8f6bff'];
CHOICE_BUILD.law=it=>({q:it.q,zones:it.o.map((t,i)=>({id:'o'+i,l:esc(t),e:'ABCD'[i],c:CS[i%4]})),cor:'o'+it.a});
if(!GAMES.find(x=>x.id==='law'))GAMES.push({id:'law',grp:'Gæt & quiz',key:'law',kind:'choice',t:'Danske love & regler',d:'Nuværende og historiske danske regler – også de skøre',e:'⚖️',g:'linear-gradient(135deg,#1d3557,#e63946)',min:2});
const d0=window.draw;let last='';
window.draw=function(gk,list){
 if(gk!=='law')return d0.apply(this,arguments);
 let it,t=0;do{it=list[Math.random()*list.length|0]}while(list.length>1&&it.q===last&&++t<6);last=it.q;
 const idx=it.o.map((_,i)=>i).sort(()=>Math.random()-.5);
 return {q:it.q,o:idx.map(i=>it.o[i]),a:idx.indexOf(it.a),e:it.e||''}};
})();
