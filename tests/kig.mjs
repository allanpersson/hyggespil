/* Hurtig visuel kontrol af enkelte spil: node tests/kig.mjs id1 id2 ... */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:8899/hs.html';
const IDS = process.argv.slice(2);
const UD = 'artefakter/kig';
fs.mkdirSync(UD, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
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

for (const id of IDS) {
  await page.goto(BASE);
  await page.waitForSelector('button.gc');
  await page.evaluate(x => window.start(x), id);
  const s = page.locator('#hsv-startspil');
  if (await s.count()) await s.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${UD}/${id}.png`, fullPage: false });
  console.log('kig:', id);
}
await browser.close();
