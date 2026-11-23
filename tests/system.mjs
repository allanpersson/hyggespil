/* Systemtest: indstillinger, første gangs start, aldersport og Play-tilstand.
 * Kør: node tests/system.mjs  (forudsætter node tools/serve.js 8899)
 */
import { chromium } from 'playwright';

const BASE = process.env.HS_URL || 'http://127.0.0.1:8899/hs.html';
const browser = await chromium.launch();
const fejl = [];
let antal = 0;

const nySide = async (init) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => fejl.push('sidefejl: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') fejl.push('konsol: ' + m.text()); });
  page.on('dialog', d => d.dismiss().catch(() => {}));
  await page.addInitScript(init);
  await page.goto(BASE);
  await page.waitForSelector('button.gc', { timeout: 10000 });
  return { ctx, page };
};
const ok = (navn, ja) => { antal++; console.log((ja ? 'OK  ' : 'FEJL') + '  ' + navn); if (!ja) process.exitCode = 1; };

/* ---------- 1) indstillinger i et spil ---------- */
{
  const { ctx, page } = await nySide(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_indst', 'true');
  });
  await page.evaluate(() => window.hsStart('harry'));
  const s = page.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await page.waitForSelector('#main .card');
  await page.click('#hsv-stil');
  await page.waitForTimeout(500);
  ok('indstillinger åbner i spillet', await page.evaluate(() => {
    const m = document.querySelector('.modal');
    return !!m && /Indstillinger til/.test(m.innerText);
  }));
  await ctx.close();
}

/* ---------- 2) første gangs start: ingen 🔞-kode ---------- */
{
  const { ctx, page } = await nySide(() => localStorage.clear());
  await page.waitForTimeout(700);
  ok('ny installation viser velkomst', await page.locator('.modal').count() > 0);
  ok('velkomsten kræver ingen 🔞-kode', (await page.locator('.modal input[type=password]').count()) === 0);
  await page.fill('#fn1', 'Anna');
  await page.fill('#fn2', 'Bo');
  await page.click('#fok');
  await page.waitForTimeout(500);
  ok('spillet starter uden kode', (await page.locator('.modal').count()) === 0);

  /* aldersport */
  await page.click('#xbtn');
  await page.waitForTimeout(300);
  ok('🔞 kræver aldersbekræftelse først', (await page.locator('#xalder').count()) === 1);
  ok('der vises ingen kode før alderen er bekræftet', (await page.locator('.modal input[type=password]').count()) === 0);
  await page.fill('#xalder', '2015');
  await page.click('#xaok');
  await page.waitForTimeout(200);
  ok('under 18 afvises', /fyldt 18/.test(await page.locator('#xamsg').innerText()));
  await page.fill('#xalder', '1985');
  await page.click('#xaok');
  await page.waitForTimeout(300);
  ok('18+ giver kodevalg', (await page.locator('.modal input[type=password]').count()) === 2);
  await ctx.close();
}

/* ---------- 3) Play-tilstand: ingen køb uden for butikken ---------- */
{
  const { ctx, page } = await nySide(() => {
    window.HSA = { play: true };
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_indst', 'true');
  });
  ok('Play-tilstand er aktiv', await page.evaluate(() => window.HSPLAY === true));
  ok('ingen link til køb uden for butikken', await page.evaluate(() =>
    [...document.querySelectorAll('a')].every(a => !(a.href || '').includes('buymeacoffee'))));
  await page.click('#fstotte');
  await page.waitForTimeout(300);
  ok('Støt-dialogen åbner', (await page.locator('#stotte').count()) === 1);
  await ctx.close();
}

/* ---------- 4) Android-tilstand: indstillinger uden HA-felter ---------- */
{
  const { ctx, page } = await nySide(() => {
    window.HSA = { android: true, play: true };
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_indst', 'true');
  });
  ok('telefonen bruger Android-tilstand', await page.evaluate(() => window.HSPLATFORM === 'android'));
  await page.evaluate(() => window.hsStart('harry'));
  const s = page.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await page.waitForSelector('#main .card');
  await page.click('#hsv-stil');
  await page.waitForTimeout(400);
  const tekst = await page.evaluate(() => {
    const m = document.querySelector('.modal');
    return m ? m.innerText.replace(/\s+/g, ' ') : '';
  });
  ok('indstillinger åbner på Android', /Indstillinger til/.test(tekst));
  ok('ingen Music Assistant-felter på Android', !/Music Assistant/i.test(tekst));
  ok('ingen HA-højttaler på Android', !/Home Assistant-højttaler/i.test(tekst));
  await page.click('#hsv-startspil');
  await page.waitForTimeout(500);
  ok('«Start spil» virker fra indstillingerne', (await page.locator('.modal').count()) === 0);
  await ctx.close();
}

await browser.close();
console.log(antal + ' tjek, ' + fejl.length + ' sidefejl');
if (fejl.length) console.log(fejl.slice(0, 6).join('\n'));
if (fejl.length) process.exitCode = 1;
