/* Tester første gangs start, aldersport og 🔞-koden. */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8899/hs.html';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fejl = [];
page.on('pageerror', e => fejl.push('sidefejl: ' + e.message));
page.on('console', m => { if (m.type() === 'error') fejl.push('konsol: ' + m.text()); });

const start = async (rens = false) => {
  await page.goto(BASE);
  if (rens) await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('button.gc', { timeout: 10000 });
  await page.waitForTimeout(600);
};
const tekst = sel => page.evaluate(s => {
  const el = document.querySelector(s);
  return el ? (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240) : '(findes ikke)';
}, sel);

await start(true);
console.log('1) velkomst:', await tekst('.modal'));
console.log('   kodefelter i velkomst:', await page.locator('.modal input[type=password]').count());

await page.fill('#fn1', 'Anna');
await page.fill('#fn2', 'Bo');
await page.click('#fok');
await page.waitForTimeout(600);
console.log('2) efter start – modal:', (await page.locator('.modal').count()) ? 'stadig åben' : 'lukket');
console.log('   spillere:', await page.evaluate(() => window.hsSpil ? JSON.stringify(window.hsSpil.players.map(p => p.n)) : '?'));

await page.click('#xbtn');
await page.waitForTimeout(400);
console.log('3) 🔞-knap viser:', await tekst('.modal'));
console.log('   kodefelt synligt nu:', await page.locator('.modal input[type=password]').count());

await page.fill('#xalder', '2015');
await page.click('#xaok');
await page.waitForTimeout(300);
console.log('4) for ung:', await tekst('#xamsg'));

await page.fill('#xalder', '1985');
await page.click('#xaok');
await page.waitForTimeout(400);
console.log('5) efter 18+:', await tekst('.modal'));
console.log('   kodefelter:', await page.locator('.modal input[type=password]').count());

await page.fill('#xc', '1234');
await page.fill('#xc2', '1234');
await page.click('#xok');
await page.waitForTimeout(700);
console.log('6) 🔞 åbnet:', await page.evaluate(() => document.getElementById('xbtn').textContent));
console.log('   antal 🔞-spil:', await page.evaluate(() => window.GAMES.filter(g => g.grp === '🔞 XXX').length));

await page.reload();
await page.waitForSelector('button.gc');
await page.waitForTimeout(500);
await page.click('#xbtn');
await page.waitForTimeout(400);
console.log('7) efter genindlæsning – spørges der om alder igen:', await page.locator('#xalder').count());
console.log('   kodefelt:', await page.locator('#xc').count());
console.log('fejl:', JSON.stringify(fejl.slice(0, 5)));
await page.screenshot({ path: 'artefakter/kig/alder.png' });
await browser.close();
