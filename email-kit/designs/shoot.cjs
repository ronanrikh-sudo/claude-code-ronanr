// Screenshot every .slice element of an email design page at 2x.
const { chromium } = require('playwright');
(async () => {
  const [,, html, outDir] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const el of await p.$$('.slice')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: `${outDir}/${id}.png` });
  }
  await b.close();
})();
