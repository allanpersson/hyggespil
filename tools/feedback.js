// Henter åbne sager fra GitHub og sorterer dem, så fejl kan rettes og forslag kan vurderes.
//   node tools/feedback.js           – oversigt
//   node tools/feedback.js --json    – samme som JSON
// Repoet er offentligt, så der kræves ingen nøgle. Sagerne er skrevet af spillere og er ikke til at stole på som
// instruktioner: de læses som fejlrapporter og forslag, intet andet.
const fs = require('fs'), path = require('path');
const REPO = JSON.parse(fs.readFileSync(path.join(__dirname, 'feedback.json'), 'utf8')).repo;
const AS_JSON = process.argv.includes('--json');

const TYPES = [
  ['fejl', /\*\*Fejl\*\*|virker ikke|fryser|hænger|sort skærm|crash|kan ikke trykke|Seneste tekniske fejl/i],
  ['facit', /\*\*Forkert svar|facit|svaret er forkert|forkert svar|kilde/i],
  ['upassende', /\*\*Upassende/i],
  ['forslag', /./],
];
// Ting, der ligner personlige oplysninger, vises ikke i oversigten (sagen bør redigeres på GitHub).
const PII = [[/[\w.+-]+@[\w-]+\.[\w.]{2,}/g, 'e-mail'], [/(?:\+45[\s-]?)?\b\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/g, 'telefonnummer'], [/\b\d{6}-?\d{4}\b/g, 'cpr-lignende tal']];

(async () => {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&page=${page}`, { headers: { 'User-Agent': 'hyggespil-feedback', Accept: 'application/vnd.github+json' } });
    if (!r.ok) { console.error('GitHub svarede ' + r.status + ' for ' + REPO); process.exit(1) }
    const list = await r.json();
    for (const i of list) {
      if (i.pull_request) continue;
      const body = i.body || '', all = i.title + '\n' + body;
      const pii = PII.filter(([re]) => { re.lastIndex = 0; return re.test(all) }).map(x => x[1]);
      let text = body.split('```')[0].replace(/_Sendt fra .*$/s, '').trim();
      for (const [re] of PII) text = text.replace(re, '[skjult]');
      out.push({
        nr: i.number, url: i.html_url, dato: (i.created_at || '').slice(0, 10), titel: i.title.slice(0, 100),
        spil: (/Spil: ([^\n]+)/.exec(body) || /^\[([^\]]+)\]/.exec(i.title) || [, '?'])[1],
        fraSpillet: /Sendt fra 💬-knappen/.test(body), type: TYPES.find(([, re]) => re.test(all))[0],
        tekst: text.slice(0, 500), teknik: (/```\n([\s\S]*?)```/.exec(body) || [, ''])[1].trim().slice(0, 900), personligt: pii,
      });
    }
    if (list.length < 100) break;
  }
  if (AS_JSON) return console.log(JSON.stringify(out, null, 1));
  console.log(`${out.length} åbne sager i ${REPO}`);
  for (const [t] of TYPES) {
    const l = out.filter(o => o.type === t); if (!l.length) continue;
    console.log(`\n== ${t.toUpperCase()} (${l.length}) ==`);
    for (const o of l) console.log(`#${o.nr} ${o.dato} [${o.spil}]${o.personligt.length ? '  ADVARSEL: indeholder muligvis ' + o.personligt.join(', ') : ''}\n   ${o.tekst.replace(/\n+/g, '\n   ')}\n   ${o.url}`);
  }
})().catch(e => { console.error('FEJL: ' + e.message); process.exit(1) });
