/* Reproducerer «indstillinger» i spillet og på forsiden. */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8899/hs.html';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fejl = [];
page.on('pageerror', e => fejl.push('sidefejl: ' + e.message));
page.on('console', m => { if (m.type() === 'error') fejl.push('konsol: ' + m.text()); });

await page.addInitScript(() => {
  localStorage.setItem('hs_players', JSON.stringify([
    { n: 'A', c: '#ff5d8f', s: 0, age: 30 },
    { n: 'B', c: '#ffb703', s: 0, age: 30 },
  ]));
  localStorage.setItem('hs_indst', 'true');
  localStorage.setItem('hs_forst', 'ja');
  localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
  localStorage.setItem('hs_disclaimer', 'ja');
  localStorage.setItem('hs_16', 'ja');
});

await page.goto(BASE);
await page.waitForSelector('button.gc');
console.log('HSV:', await page.evaluate(() => typeof window.HSV));

await page.evaluate(() => window.hsStart('harry'));
const s = page.locator('#hsv-startspil');
if (await s.count()) await s.click();
await page.waitForSelector('#main .card', { timeout: 8000 });
await page.waitForTimeout(500);

const knapper = await page.evaluate(() => [...document.querySelectorAll('#main button')].map(b => ({
  id: b.id, tekst: (b.textContent || '').trim().slice(0, 20), titel: b.title || '',
})));
console.log('bar-knapper:', JSON.stringify(knapper));

/* tryk på tandhjulet */
const gear = page.locator('#main .bar button', { hasText: '⚙' }).first();
console.log('gear antal:', await gear.count());
if (await gear.count()) {
  await gear.click();
  await page.waitForTimeout(800);
  console.log('modal efter gear:', await page.evaluate(() => {
    const m = document.querySelector('.modal');
    return m ? (m.innerText || '').replace(/\s+/g, ' ').slice(0, 200) : '(ingen modal)';
  }));
} else {
  /* prøv titler */
  const t = page.locator('#main .bar button[title*="ndst"]').first();
  console.log('title-knap:', await t.count());
  if (await t.count()) { await t.click(); await page.waitForTimeout(600); }
}

console.log('fejl:', JSON.stringify(fejl.slice(0, 5), null, 1));
await page.screenshot({ path: 'artefakter/kig/indstillinger.png' });
await browser.close();
