/* Daglig spiltest: vælger 1–5 spil ud fra datoen (eller alle) og spiller dem i
 * Chromium. Tjekker funktion, UI og game play og skriver docs/spiltest.md.
 *
 * Testen kender både de klassiske quiz-kort (.q/.mc4opt/.zone), de egne
 * spilkort (t1, c1, hjul, mysterier …) og spil med indtastning.
 *
 * Kør: node tests/spiltest.mjs [antal|alle]
 * Forudsætter: node tools/serve.js 8899
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.HS_URL || 'http://127.0.0.1:8899/hs.html';
const ARG = process.argv[2] || '5';
const ALLE = ARG === 'alle';
const ANTAL = ALLE ? 999 : Math.max(1, Math.min(5, +ARG));
const UD = 'artefakter/spiltest';
const RAPPORT = ALLE ? 'docs/spiltest.md' : 'docs/spiltest-dag.md';
fs.mkdirSync(UD, { recursive: true });

const idag = new Date().toISOString().slice(0, 10);
const frø = [...idag].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

let konsolfejl = [];
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (/Failed to load resource.*(extra\.json|favicon\.ico)/.test(t)) return;
  konsolfejl.push(t);
});
page.on('pageerror', e => konsolfejl.push('sidefejl: ' + e.message));
page.on('dialog', d => d.dismiss().catch(() => {}));

await page.addInitScript(() => {
  localStorage.setItem('hs_players', JSON.stringify([
    { n: 'Test A', c: '#ff5d8f', s: 0, t: 0, age: 30 },
    { n: 'Test B', c: '#ffb703', s: 0, t: 0, age: 30 },
    { n: 'Test C', c: '#2ec4b6', s: 0, t: 0, age: 30 },
  ]));
  localStorage.setItem('hs_xlock', JSON.stringify({ s: 'salt', k: 'kontrol' }));
  localStorage.setItem('hs_forst', 'ja');
  localStorage.setItem('hs_indst', 'true');
  localStorage.setItem('hs_disclaimer', 'ja');
  localStorage.setItem('hs_16', 'ja');
});

await page.goto(BASE);
await page.waitForSelector('button.gc');

const spil = await page.evaluate(() => (window.GAMES || [])
  .filter(g => !g.skjult && g.kind !== 'menu')
  .map(g => ({ id: g.id, t: g.t, kind: g.kind, key: g.key, min: g.min || 2, kommerSnart: g.kommerSnart })));

const valgte = [];
if (ALLE) valgte.push(...spil);
else for (let i = 0; i < spil.length && valgte.length < ANTAL; i++) {
  const g = spil[(frø + i * 7) % spil.length];
  if (g && !valgte.some(x => x.id === g.id)) valgte.push(g);
}

/* Læser skærmen: tekst, valgmuligheder, felter, knapper og overløb. */
const læs = () => page.evaluate(() => {
  const m = document.querySelector('#main') || document.body;
  const tekst = (m.innerText || '').replace(/\s+/g, ' ').trim();
  const knapper = [...m.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean);
  const felter = [...m.querySelectorAll('input:not([type=hidden]), textarea')];
  /* tekst, der rager ud over skærmen, eller som er klippet af sin boks */
  let klippet = 0;
  for (const el of m.querySelectorAll('div,span,p,h1,h2,h3,button')) {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && !el.querySelector('div,span,p')) klippet++;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > window.innerWidth + 2) klippet++;
  }
  return {
    tekst: tekst.slice(0, 120),
    længde: tekst.length,
    mc4: m.querySelectorAll('.mc4opt').length,
    zoner: m.querySelectorAll('.zone:not(.pool)').length,
    bogstaver: m.querySelectorAll('[data-b]').length,
    felter: felter.length,
    knapper: knapper.slice(0, 12),
    bredde: document.documentElement.scrollWidth - window.innerWidth,
    klippet,
  };
});

/* Spiller én runde: svar, indtastning eller næste-knap. */
const spilRunde = () => page.evaluate(() => {
  const klik = el => { el.click(); return true; };
  const opt = document.querySelector('.mc4opt:not([disabled])');
  if (opt) return klik(opt) && 'svar';
  const zone = document.querySelector('.zone:not(.pool)');
  if (zone) return klik(zone) && 'zone';
  const bogstav = document.querySelector('#main [data-b]:not(:disabled)');
  if (bogstav) return klik(bogstav) && 'bogstav';

  /* indtastningsspil: skriv et rimeligt bud og tryk tjek/afslør */
  const felt = document.querySelector('#main input:not([type=hidden]):not([type=checkbox]):not([type=radio]), #main textarea');
  if (felt) {
    const tal = document.querySelector('#main').innerText.match(/\d+/);
    felt.value = felt.type === 'number' ? String(tal ? +tal[0] : 7) : (tal ? tal[0] : '7');
    felt.dispatchEvent(new Event('input', { bubbles: true }));
    felt.dispatchEvent(new Event('change', { bubbles: true }));
    const knap = [...document.querySelectorAll('#main button')].find(b => !b.disabled &&
      /tjek|svar|lås|vurder|godkend|afslør|se facit|gæt/i.test((b.textContent || '').trim()));
    if (knap) return klik(knap) && ('skrev + ' + knap.textContent.trim().slice(0, 14));
  }

  /* kortspil: sæt en nål midt på kortet, så «Lås pin» bliver aktiv */
  const kort = document.querySelector('#map');
  if (kort) {
    const r = kort.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (const type of ['pointerdown', 'pointerup', 'click']) {
      kort.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
    }
  }

  const knap = [...document.querySelectorAll('#main button')].find(b => {
    /* knapperne starter ofte med et ikon – fjern det før teksten matches */
    const t = (b.textContent || '').trim().toLowerCase().replace(/^[^a-zæøå0-9]+/, '');
    return !b.disabled && /^(næste|naeste|snurr|afslør|kast|start|giv|vis|træk|jeg kan|afspil|åbn|se facit|videre|stem|lås|hold|tryk|slip|venstre|højre|ny |nyt|spil|rul|skift|græker|sygdom|vælg|tag|del|bland|klik|skub|drej|sæt|fortsæt)/.test(t);
  });
  if (knap) return klik(knap) && knap.textContent.trim().slice(0, 16);
  return '';
});

const linjer = [`# Spiltest – ${idag}`, '', `Spil testet: ${valgte.length}`, ''];
const fund = [];

for (const g of valgte) {
  const noter = [];
  konsolfejl = [];
  let snart = '';
  try {
    await page.goto(BASE);
    await page.waitForSelector('button.gc');
    await page.evaluate(id => (window.hsStart || window.start)(id), g.id);
    const startKnap = page.locator('#hsv-startspil');
    if (await startKnap.count()) await startKnap.click();

    try {
      await page.waitForSelector('#main .card', { timeout: 8000 });
    } catch (e) {
      /* spil under «Kommer snart»-grænsen skal netop ikke starte */
      snart = await page.evaluate(() => {
        const m = document.querySelector('.modal');
        return m ? (m.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) : '';
      });
      if (!/kommer snart|på vej|åbner, når/i.test(snart)) throw e;
      await page.screenshot({ path: `${UD}/${g.id}-snart.png` });
      const luk = page.locator('.modal button', { hasText: 'Okay' });
      if (!(await luk.count())) noter.push('«Kommer snart»-dialogen kan ikke lukkes');
      else {
        await luk.first().click();
        await page.waitForTimeout(300);
        if (await page.evaluate(() => document.body.classList.contains('igang'))) {
          noter.push('«Kommer snart» lukkede ikke spillet');
        }
      }
    }

    if (!snart) {
      const start = await læs();
      if (start.længde < 15 || (!start.mc4 && !start.zoner && !start.felter && !start.knapper.length)) {
        noter.push('ingen indhold på skærmen ved start');
      }
      if (start.bredde > 2) noter.push(`vandret overløb ${start.bredde}px`);
      if (start.klippet > 2) noter.push(`${start.klippet} element(er) rager ud over skærmen`);

      let runder = 0;
      for (let i = 0; i < 2; i++) {
        /* kortspil: sæt en nål med et rigtigt klik midt på globussen */
        const kort = page.locator('#map canvas, #map svg');
        if (await page.locator('#map').count()) {
          await kort.first().waitFor({ timeout: 6000 }).catch(() => {});
          const boks = await kort.first().boundingBox().catch(() => null);
          if (boks && boks.width > 0) {
            await page.mouse.click(boks.x + boks.width / 2, boks.y + boks.height / 2);
            await page.waitForTimeout(350);
          }
        }
        const handling = await spilRunde();
        if (!handling) break;
        runder++;
        await page.waitForTimeout(550);
        const nu = await læs();
        if (nu.bredde > 2) { noter.push(`vandret overløb ${nu.bredde}px efter «${handling}»`); break; }
      }
      if (!runder) noter.push('kunne ikke spille en enkelt runde');

      await page.screenshot({ path: `${UD}/${g.id}.png` });
      if (konsolfejl.length) noter.push('konsolfejl: ' + konsolfejl.join(' | ').slice(0, 160));

      /* «← Alle spil» skal føre hjem og lande ved det spil, man kom fra */
      const tilbage = page.locator('#main button', { hasText: 'Alle spil' }).first();
      if (await tilbage.count()) {
        await tilbage.click();
        await page.waitForTimeout(700);
        const pos = await page.evaluate(id => {
          const hjemme = !document.body.classList.contains('igang');
          const c = window.hsKort ? window.hsKort(id) : [...document.querySelectorAll('button.gc')]
            .find(b => (b.getAttribute('onclick') || '').includes("'" + id + "'"));
          if (!c) return { hjemme, fundet: false };
          const r = c.getBoundingClientRect();
          return { hjemme, fundet: true, synlig: r.top >= 0 && r.top < window.innerHeight - 20 };
        }, g.id);
        if (!pos.hjemme) noter.push('«← Alle spil» førte ikke tilbage til forsiden');
        else if (!pos.fundet) noter.push('spilkortet blev ikke fundet efter «← Alle spil»');
        else if (!pos.synlig) noter.push('«← Alle spil» landede ikke ved spillet');
      }
    }
  } catch (e) {
    noter.push('FEJL: ' + e.message.slice(0, 140));
  }
  if (noter.length) fund.push(g.id + ': ' + noter.join('; '));
  linjer.push(`## ${g.t} (${g.id})`);
  linjer.push(`- type: ${g.kind} · pulje: ${g.key || '-'}`);
  if (snart) linjer.push('- OK: «Kommer snart» – puljen er under grænsen, og start er blokeret korrekt');
  else linjer.push(noter.length ? '- fund: ' + noter.join('; ') : '- OK: startede, kunne spilles og tegnede korrekt');
  linjer.push(`- skærmbillede: \`${UD}/${g.id}${snart ? '-snart' : ''}.png\``);
  linjer.push('');
}

await browser.close();
fs.writeFileSync(RAPPORT, linjer.join('\n') + '\n', 'utf8');
console.log(`spiltest: ${valgte.length} spil, ${fund.length} med fund`);
console.log(fund.join('\n'));
if (fund.length) process.exit(1);
