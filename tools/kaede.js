// Bygger verificerbare ordkæder ud fra en ordliste (bogstav-logik), så ingen kæde kan blive usammenhængende.
// Kør: node tools/kæde.js <start> <længde> [ordliste-fil]
const ord = ['SOLSTEN','NAPSET','TUSCH','HATTET','TEJN','NUDE','ENDEN','DRENG','GRIS','SOL','LAND','DAG','GALGE','ELGEDE','ENDEL','LOFFET','TRENSE','NOTER','RUNDER','REDSKAB','BOMULD','DANSK','KRUSE','ELSKET','TUSIND','KAGE','ENSARTER','TANKER','RISIKO','OVERDEL','LIDT','DØR','REOL','LAMPE','ETAGE','KØD','DÅSE','EDDIKE','EMALJE','BLYANT','HÆFTE','ETUI','VEST','TASKE','ELSE','SNE','EDDERKOP','PILLE','ELPære','ÆBLE','BILLE','ELLER','REB','BOG','GOLV','VÆG','GARDIN','NØGLEN','NEKROLOG','GRIS','SVIN','NÆSE','ESEL','LIRI','IMPRO','OVERSKRIFT','TEJN','NIROE','ESEL','LAMPESKÆRM'];
const start = process.argv[2] || 'SOLSTEN', længde = +(process.argv[3] || 9), max = +(process.argv[4] || 7);
const pool = [...new Set(ord.map(w => w.toUpperCase()))].filter(w => w.length <= max && w !== start);
const kæder = [[start]];
while (kæder.length) {
  const k = kæder.shift();
  const sidste = k[k.length - 1].slice(-1);
  const næste = pool.filter(w => w[0] === sidste && !k.includes(w));
  for (const n of næste) {
    const ny = k.concat(n);
    if (ny.length >= længde) {
      console.log('KÆDE (' + ny.length + ' led): ' + ny.join(' → '));
      console.log('  som json: chain:[' + ny.map(w => "'" + w + "'").join(',') + ']');
      process.exit(0);
    }
    kæder.push(ny);
  }
}
console.log('ingen kæde på ' + længde + ' led fundet med højst ' + max + ' bogstaver');
