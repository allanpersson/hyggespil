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

/* ---------- 1b) Gaming er ét samlet kort ---------- */
{
  const { ctx, page } = await nySide(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_indst', 'true');
  });
  const antal = await page.evaluate(() => [...document.querySelectorAll('button.gc')]
    .filter(b => /gamingmix|gamingquiz|konsolquiz|spilnavn|gaminghistorie|gamingleg/.test(b.getAttribute('onclick') || '')).length);
  const navn = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button.gc')].find(x => (x.getAttribute('onclick') || '').includes('gamingmix'));
    return b ? b.querySelector('.t').textContent : '';
  });
  ok('Gaming vises som ét samlet kort', antal === 1 && navn === 'Gaming');
  await ctx.close();
}

/* ---------- 2) første gangs start: ingen 🔞-kode ---------- */
{
  const { ctx, page } = await nySide(() => localStorage.clear());
  await page.waitForSelector('#fn1', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(200);
  ok('ny installation viser velkomst', await page.locator('.modal').count() > 0);
  ok('velkomsten kræver ingen 🔞-kode', (await page.locator('.modal input[type=password]').count()) === 0);
  await page.fill('#fn1', 'Anna');
  await page.fill('#fn2', 'Bo');
  await page.click('#fok');
  await page.waitForTimeout(500);
  ok('spillet starter uden kode', (await page.locator('.modal').count()) === 0);

  /* aldersport */
  await page.click('#menubtn');
  await page.waitForSelector('[data-m="voksen"]');
  await page.click('[data-m="voksen"]');
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

/* ---------- 5) solo: én spiller ---------- */
{
  const { ctx, page } = await nySide(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'Solo', c: '#ff5d8f', s: 0, age: 30 }]));
    localStorage.setItem('hs_indst', 'true');
  });
  ok('én spiller kræver ikke spillervalg', (await page.locator('.modal').count()) === 0);
  await page.evaluate(() => window.hsStart('tf'));
  const s = page.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await page.waitForSelector('#main .card');
  ok('et solo-spil starter med én spiller', (await page.locator('#main .q').count()) === 1);
  await ctx.close();
}

/* ---------- 6) engelsk: menuer og indhold ---------- */
{
  const { ctx, page } = await nySide(() => {
    localStorage.setItem('hs_lang', 'en');
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_indst', 'true');
  });
  ok('siden skifter til engelsk', await page.evaluate(() => document.documentElement.lang === 'en'));
  ok('titlen er Hygge Games', (await page.title()) === 'Hygge Games');
  ok('kun spil med engelsk indhold vises', await page.evaluate(() => {
    const ids = [...document.querySelectorAll('button.gc')].map(b => (b.getAttribute('onclick') || '').match(/'([^']+)'/)?.[1]);
    return ids.length >= 10 && !ids.includes('zip') && !ids.includes('law') && !ids.includes('ftl') && ids.includes('tf');
  }));
  await page.evaluate(() => window.hsStart('tf'));
  const s = page.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await page.waitForSelector('#main .card');
  const q = await page.evaluate(() => (document.querySelector('#main .q') || {}).textContent || '');
  ok('spørgsmålet er på engelsk', /[A-Za-z]/.test(q) && !/[æøå]/i.test(q));
  ok('knapperne er på engelsk', await page.evaluate(() =>
    [...document.querySelectorAll('#main .bar button')].some(b => /End game/.test(b.title || ''))));
  await ctx.close();
}

/* ---------- 5) Ordhjulet: bynavne og én linje ---------- */
{
  const { ctx, page } = await nySide(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_indst', 'true');
  });
  await page.evaluate(() => window.hsStart('wheel'));
  const s = page.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await page.waitForSelector('#main .wboard');
  const mål = await page.evaluate(() => {
    const prøv = t => {
      g.pz = { c: 'Dansk by', t }; g.ph = 'spin'; g.msg = ''; render();
      const ord = [...document.querySelectorAll('.wword')];
      const board = document.querySelector('.wboard');
      return {
        linjer: new Set(ord.map(w => Math.round(w.getBoundingClientRect().top))).size,
        over: board.scrollWidth > board.clientWidth + 1,
        side: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    };
    return {
      kort: prøv('SVENSTRUP'),
      langt: prøv('VESTER SKERNINGE'),
      navne: [hsByNavn('Svenstrup J'), hsByNavn('København K: Dagbladet Børsen'), hsByNavn('Nørre Nebel')],
    };
  });
  ok('ordhjulet: ét ord står på én linje', mål.kort.linjer === 1 && !mål.kort.over && !mål.kort.side);
  ok('ordhjulet: langt svar flyder ikke over', !mål.langt.over && !mål.langt.side);
  ok('ordhjulet: bynavne renses for distrikter og posthuse', mål.navne[0] === 'Svenstrup' && mål.navne[1] === '' && mål.navne[2] === 'Nørre Nebel');
  await ctx.close();
}

/* ---------- 6) Tilbageknappen ---------- */
{
  const { ctx, page } = await nySide(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#ff5d8f', s: 0, age: 30 }, { n: 'B', c: '#ffb703', s: 0, age: 30 }]));
    localStorage.setItem('hs_indst', 'true');
  });
  await page.evaluate(() => window.hsStart('tf'));
  const s = page.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await page.waitForSelector('#main .bar');
  const iSpil = await page.evaluate(() => window.hsTilbage());
  const hjemme = await page.evaluate(() => ({ tilbage: window.hsTilbage(), bar: !!document.querySelector('#main .bar') }));
  await page.click('#menubtn');
  await page.waitForSelector('.modal');
  const dialog = await page.evaluate(() => ({ tilbage: window.hsTilbage(), modal: !!document.querySelector('.modal') }));
  ok('tilbage: spil → hjem', iSpil === true && !hjemme.bar);
  ok('tilbage: hjemme lukker ikke appen', hjemme.tilbage === false);
  ok('tilbage: dialog lukkes', dialog.tilbage === true && !dialog.modal);
  await ctx.close();
}

await browser.close();
console.log(antal + ' tjek, ' + fejl.length + ' sidefejl');
if (fejl.length) console.log(fejl.slice(0, 6).join('\n'));
if (fejl.length) process.exitCode = 1;
