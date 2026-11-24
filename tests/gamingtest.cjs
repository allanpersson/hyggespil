const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const fejl = [];
  p.on('pageerror', e => fejl.push(e.message));
  await p.addInitScript(() => {
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'x', k: 'y' }));
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'A', c: '#fff', age: 30 }, { n: 'B', c: '#000', age: 30 }]));
  });
  await p.goto('http://127.0.0.1:8899/hs.html');
  await p.waitForSelector('button.gc');
  await p.evaluate(() => window.hsStart('gamingmix'));
  const s = p.locator('#hsv-startspil'); if (await s.count()) await s.click();
  await p.waitForSelector('#main .card');
  const set = new Set();
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(350);
    const info = await p.evaluate(() => {
      const t = document.querySelector('#main .bar .tag');
      return {
        tag: t ? t.textContent.trim() : '?',
        quiz: !!document.querySelector('.mc4opt'),
        kort: !!document.querySelector('.chip[data-award]'),
      };
    });
    set.add(info.tag);
    console.log('runde', i + 1, '|', info.tag, '|', info.quiz ? 'quiz' : info.kort ? 'kort' : 'andet');
    await p.evaluate(() => {
      const o = document.querySelector('.mc4opt'); if (o) { o.click(); return; }
      const a = document.querySelector('.chip[data-award]'); if (a) { a.click(); return; }
      const k = document.getElementById('skip'); if (k) k.click();
    });
    await p.waitForTimeout(800);
    await p.evaluate(() => { const n = document.getElementById('nx'); if (n) n.click(); const k = document.getElementById('skip'); if (k) k.click(); });
    await p.waitForTimeout(400);
  }
  console.log('forskellige spil:', [...set].join(' / '));
  console.log('fejl:', JSON.stringify(fejl.slice(0, 3)));
  await b.close();
})();
