/* To telefoner i samme rum – uden Home Assistant. */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8899/hs.html';
const browser = await chromium.launch();
const fejl = [];

const ny = async () => {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  p.on('pageerror', e => fejl.push(e.message));
  await p.addInitScript(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'x', k: 'y' }));
    localStorage.setItem('hs_players', JSON.stringify([
      { n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 },
    ]));
    localStorage.setItem('hs_indst', 'true');
  });
  await p.goto(BASE);
  await p.waitForSelector('button.gc');
  await p.click('#menubtn');
  await p.waitForSelector('[data-m="rum"]');
  await p.click('[data-m="rum"]');
  await p.waitForSelector('.modal');
  return { c, p };
};
const tekst = p => p.evaluate(() => {
  const el = document.getElementById('rumspil');
  return el && el.style.display !== 'none' ? (el.innerText || '').replace(/\s+/g, ' ') : '(intet)';
});

const vært = await ny();
await vært.p.click('#rum-nyt');
await vært.p.waitForTimeout(1200);
const kode = (await vært.p.locator('.rumkode').innerText()).trim();
console.log('rumkode:', kode);

/* værten er automatisk med */
await vært.p.waitForTimeout(800);

const gæst = await ny();
await gæst.p.fill('#rum-kode', kode);
await gæst.p.fill('#rum-navn', 'Gæst');
await gæst.p.click('#rum-join');
await gæst.p.waitForTimeout(1500);

await vært.p.selectOption('#rum-pulje', 'tl');
await vært.p.click('#rum-start');
await vært.p.waitForTimeout(1800);
console.log('vært:', (await tekst(vært.p)).slice(0, 90));
console.log('gæst:', (await tekst(gæst.p)).slice(0, 90));

/* begge telefoner ser samme spørgsmål, og turen er markeret */
console.log('tur – vært:', (await tekst(vært.p)).slice(0, 60));
console.log('tur – gæst:', (await tekst(gæst.p)).slice(0, 60));

/* privat kort: taboo */
await vært.p.click('#rum-aabn');
await vært.p.waitForSelector('#rum-pulje');
await vært.p.selectOption('#rum-pulje', 'taboo');
await vært.p.waitForTimeout(400);
await vært.p.locator('#rum-start').click({ force: true });
await vært.p.waitForTimeout(2000);
console.log('taboo – vært:', (await tekst(vært.p)).slice(0, 90));
console.log('taboo – gæst:', (await tekst(gæst.p)).slice(0, 90));

/* Kun den, hvis tur det er, må se ordet. Find forklareren og tjek den anden. */
const læs = p => p.evaluate(() => {
  const t = (document.getElementById('rumspil') || {}).innerText || '';
  const i = t.indexOf('Du må ikke sige:');
  if (i < 0) return { ord: '', tekst: t };
  const linjer = t.slice(0, i).trim().split('\n');
  return { ord: (linjer[linjer.length - 1] || '').trim(), tekst: t };
});
const hv = await læs(vært.p), hg = await læs(gæst.p);
const forklarer = hv.ord ? 'vært' : hg.ord ? 'gæst' : '';
const ord = hv.ord || hg.ord;
const anden = forklarer === 'vært' ? hg.tekst : hv.tekst;
console.log('forklarer:', forklarer || '(ingen)', '| ord:', JSON.stringify(ord));
console.log('den anden kan ikke se ordet:', !!ord && !anden.includes(ord));

console.log('fejl:', JSON.stringify(fejl.slice(0, 4)));
await browser.close();
