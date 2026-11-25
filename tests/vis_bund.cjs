const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const fejl = [];
  p.on('pageerror', e => fejl.push(e.message));
  await p.addInitScript(() => {
    localStorage.setItem('hs_lang', 'en');
    localStorage.setItem('hs_forst', 'ja');
    localStorage.setItem('hs_xlock', JSON.stringify({ s: 'x', k: 'y' }));
    localStorage.setItem('hs_players', JSON.stringify([{ n: 'Allan', c: '#ff5d8f', s: 6, age: 30 }, { n: 'Test', c: '#ffb703', s: 4, age: 30 }]));
  });
  await p.goto('http://127.0.0.1:8899/hs.html');
  await p.waitForSelector('button.gc');
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'artefakter/kig/en-bund.png' });
  console.log(await p.evaluate(() => {
    const d = document.getElementById('discl');
    return d ? d.innerText.slice(0, 200) : '(ingen)';
  }));
  console.log('fejl:', JSON.stringify(fejl.slice(0, 3)));
  await b.close();
})();
