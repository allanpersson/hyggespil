/* Visuel og gameplay-test i rigtig Chromium.
 *
 * Starter spillets lokale server (tools/serve.js) og tjekker:
 *   - at forsiden tegnes uden konsolfejl,
 *   - at kortenes tekst, tælling og badges ikke overlapper,
 *   - at undermenuen for Musikquiz åbner med alle kategorier,
 *   - at et spil kan startes, at et svar kan vælges, og at afsløringen vises,
 *   - at siden ser fornuftig ud i både desktop- og telefonbredde (screenshots).
 *
 * Kør: node tests/visuel.mjs   (serveren skal køre på port 8899)
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.HS_URL || 'http://127.0.0.1:8899/hs.html';
const UD = 'artefakter';
fs.mkdirSync(UD, { recursive: true });

const fejl = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (/Failed to load resource.*(extra\.json|favicon\.ico)/.test(t)) return;   // forventet i lokal test
  fejl.push('konsol: ' + t);
});
page.on('pageerror', e => fejl.push('sidefejl: ' + e.message));

await page.addInitScript(() => {
  localStorage.setItem('hs_players', JSON.stringify([
    { n: 'Test A', c: '#ff5d8f', s: 0, t: 0, age: 30 },
    { n: 'Test B', c: '#ffb703', s: 0, t: 0, age: 30 },
  ]));
  localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
  localStorage.setItem('hs_forst', 'ja');
  localStorage.setItem('hs_indst', 'true');
  localStorage.setItem('hs_disclaimer', 'ja');
});

await page.goto(BASE);
await page.waitForSelector('button.gc', { timeout: 30000 });

const antal = await page.locator('button.gc').count();
if (antal < 60) fejl.push(`for få spilkort: ${antal}`);

const overlap = await page.$$eval('button.gc', kort => kort.map(c => {
  const d = c.querySelector('.d'), p = c.querySelector('.pswrap');
  if (!d || !p) return 0;
  return Math.round(d.getBoundingClientRect().bottom - p.getBoundingClientRect().top);
}).filter(x => x > 1));
if (overlap.length) fejl.push(`tekst overlapper badges på ${overlap.length} kort`);

await page.screenshot({ path: `${UD}/forside-desktop.png`, fullPage: false });

/* undermenu */
await page.locator('button.gc', { hasText: 'Musikquiz' }).first().click();
await page.waitForSelector('.subcard');
const subs = await page.locator('.subcard').count();
if (subs < 9) fejl.push(`Musikquiz har kun ${subs} underkategorier`);
await page.screenshot({ path: `${UD}/undermenu.png` });
await page.locator('#sub-luk').click();

/* spil et spørgsmål */
await page.evaluate(() => window.start('harry'));
if (await page.locator('#hsv-startspil').count()) await page.locator('#hsv-startspil').click();
await page.waitForSelector('.mc4opt', { timeout: 15000 });
await page.locator('.mc4opt').first().click();
await page.waitForSelector('.mc4res .r.korrekt', { timeout: 10000 });
await page.screenshot({ path: `${UD}/quiz-afsloret.png` });

/* telefonbredde */
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE);
await page.waitForSelector('button.gc');
await page.screenshot({ path: `${UD}/forside-telefon.png`, fullPage: false });

await browser.close();

if (fejl.length) {
  console.error('FEJL:\n - ' + fejl.join('\n - '));
  process.exit(1);
}
console.log(`visuel og gameplay OK (${antal} kort, ${subs} underkategorier)`);
