/* Diagnose: åbner de spil, spiltesten ikke fandt spørgsmål i, og dumper hvad
 * skærmen faktisk viser. Bruges til at skelne falske positiver fra reelle fejl.
 *
 * Kør: node tests/diagnose.mjs id1 id2 ...
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:8899/hs.html';
const IDS = process.argv.slice(2);
const UD = 'artefakter/diagnose';
fs.mkdirSync(UD, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fejl = [];
page.on('pageerror', e => fejl.push(e.message));

await page.addInitScript(() => {
  localStorage.setItem('hs_players', JSON.stringify([
    { n: 'A', c: '#ff5d8f', s: 0, age: 30 },
    { n: 'B', c: '#ffb703', s: 0, age: 30 },
    { n: 'C', c: '#2ec4b6', s: 0, age: 30 },
  ]));
  localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
  localStorage.setItem('hs_forst', 'ja');
  localStorage.setItem('hs_indst', 'true');
  localStorage.setItem('hs_disclaimer', 'ja');
  localStorage.setItem('hs_16', 'ja');
});

const ud = [];
for (const id of IDS) {
  fejl.length = 0;
  let r = { id };
  try {
    await page.goto(BASE);
    await page.waitForSelector('button.gc');
    await page.evaluate(x => window.start(x), id);
    const s = page.locator('#hsv-startspil');
    if (await s.count()) await s.click();
    await page.waitForTimeout(900);
    r = await page.evaluate(() => {
      const m = document.querySelector('#main') || document.body;
      const knapper = [...m.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 10);
      return {
        tekst: (m.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300),
        knapper,
        html: m.innerHTML.replace(/\s+/g, ' ').slice(0, 500),
        bredde: document.documentElement.scrollWidth - window.innerWidth,
        hoejde: document.documentElement.scrollHeight - window.innerHeight,
      };
    });
    await page.screenshot({ path: `${UD}/${id}.png` });
  } catch (e) {
    r.fejl = e.message.slice(0, 200);
  }
  if (fejl.length) r.sidefejl = fejl.join(' | ').slice(0, 200);
  ud.push(r);
}

await browser.close();
fs.writeFileSync(`${UD}/diagnose.json`, JSON.stringify(ud, null, 2), 'utf8');
for (const r of ud) {
  console.log('=== ' + r.id + ' ===');
  console.log('tekst: ' + (r.tekst || '(tom)'));
  console.log('knapper: ' + ((r.knapper || []).join(' / ') || '(ingen)'));
  console.log('bredde: ' + r.bredde + '  højde: ' + r.hoejde);
  if (r.sidefejl) console.log('sidefejl: ' + r.sidefejl);
  if (r.fejl) console.log('FEJL: ' + r.fejl);
  console.log('');
}
