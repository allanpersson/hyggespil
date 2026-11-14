// Klargør udgivelsen: fjerner midlertidige testfiler, retter README-tal, tilføjer hjul-licensnote.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROD = path.join(__dirname, '..');
const W = p => path.join(ROD, p);
function saml(fil) { try { return fs.readFileSync(W('custom_components/hyggespil/www/' + fil), 'utf8') } catch (e) { return '' } }
const puljer = f => (saml(f).match(/DATA\.\w+=/g) || []).length;
const spil = () => { const kilder = ['hs2.js', 'hs3.js', 'hs4.js', 'c1.js', 'w1.js', 't1.js', 'ext.js'].map(saml).join(''); return (kilder.match(/\{id:'[a-zåøæ0-9_]+'/g) || []).length };
console.log('puljer: c1=' + puljer('c1.js') + ', w1=' + puljer('w1.js') + ', t1=' + puljer('t1.js'));

// 1) ryd op
for (const f of ['custom_components/hyggespil/www/tools-sidehjelper.js']) { try { fs.rmSync(W(f)); console.log('slettet: ' + f) } catch (e) { console.log('fant ikke: ' + f) } }
try { fs.rmSync(W('ud'), { recursive: true, force: true }); console.log('slettet: ud/') } catch (e) { }

// 2) .gitignore: logg og restefiler
let g = fs.readFileSync(W('.gitignore'), 'utf8');
for (const linje of ['ud/', 'tools/*.log', 'custom_components/hyggespil/www/backup.js.local']) if (!g.includes('\n' + linje)) g = g.trimEnd() + '\n' + linje + '\n';
fs.writeFileSync(W('.gitignore'), g);

// 3) THIRD_PARTY_NOTICES: hjul-referencen
const tp = W('THIRD_PARTY_NOTICES.md');
let t = fs.readFileSync(tp, 'utf8');
if (!t.includes('Lykkehjulet1988Round1Wheel')) {
  t = t.trimEnd() + '\n\n## Lykkehjulets design (reference – ikke en fil i spillet)\n\n' +
    'Spillet indeholder ingen billedefil fra fjernsynet. Til at efterligne de farvede felter er brugt\n' +
    'fotografiet af det oprindelige hjul, da 「Lykkehjulet» havde premiere i 1988:\n\n' +
    '- Fil: Lykkehjulet1988Round1Wheel.jpg — https://commons.wikimedia.org/wiki/File:Lykkehjulet1988Round1Wheel.jpg\n' +
    '- Ophavsret: Germanname1990 (Wikimedia Commons), 2008.\n' +
    '- Licens: CC BY-SA 3.0 — billedet er IKKE lagt ind i repoet, kun brugt som visuel reference.\n' +
    '- Hvis hjulets udseende ændres efter fotografien, sættes credit: «Foto: Germanname1990 / Wikimedia Commons, CC BY-SA 3.0».\n';
  fs.writeFileSync(tp, t); console.log('THIRD_PARTY_NOTICES.md: hjul-reference tilføjet');
}

// 4) CHANGELOG-skrivefejl
const cl = W('CHANGELOG.md'); let c = fs.readFileSync(cl, 'utf8').replace('viserÉén', 'viser én'); fs.writeFileSync(cl, c);

// 5) README: tal og nye grupper
const rp = W('README.md'); let r = fs.readFileSync(rp, 'utf8');
r = r.replace('55 spil og over 6.000 spørgsmål, opgaver og kort på dansk:', '83 spil og over 6.000 spørgsmål, opgaver og kort på dansk:');
if (!r.includes('| 🔐 Kodespil |')) {
  r = r.replace('| 🎲 Random | Alt i ét · Random børnespil |',
    '| 🔐 Kodespil | Zodiac-glyfer · Gridskrift · Punktskrift · Farver · Morse · Cæsars brev · Spejlbrev · Bogstavkæde |\n' +
    '| 🔤 Ordspil | Ord af bogstaver · Ordkæde · Ordtrappe · Ordsplit · Baglæns · Rim · Længste ord · Stavboks · Staveling |\n' +
    '| 🧮 Tal & matematik | Tænk et tal · Hovedregning · Talrækker · Overslag · Procent · Sanseprøve · Ur & tid · Bogstavværdi |\n' +
    '| 🎲 Random | Alt i ét · Random børnespil |');
}
r = r.replace('| 🦑 Dødsspils-leg |', '| 🦑 Squid Games |');
if (!r.includes('Første gang du åbner spillet')) {
  r = r.replace('## Privatliv', '## Første gang du åbner spillet\n\n' +
    'Et velkomstvindue beder dig om at vælge din egen 🔞-kode (4–8 cifre) og viser to forudoprettede spillere\n' +
    '(Spiller 1 og Spiller 2) i gruppen Standard. Du kan ændre navne, aldre og antal med det samme. Intet fra\n' +
    'udviklerens eget spil – ingen navne, point, svarede spørgsmål eller gemte spil – følger med installationen.\n\n## Privatliv');
}
fs.writeFileSync(rp, r);
console.log('README.md opdateret (spil: ' + (r.match(/83 spil/) ? '83' : '?') + ')');
