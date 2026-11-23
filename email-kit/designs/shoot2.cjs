// Screenshot every .slice at 2x after fonts load and the page sets body[data-ready].
const { chromium } = require('playwright');
(async () => {
  const [,, html, outDir] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + html, { waitUntil: 'networkidle' });
  await p.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
  await p.waitForTimeout(300);
  for (const el of await p.$$('.slice')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: `${outDir}/${id}.png` });
  }
  await b.close();
})();
