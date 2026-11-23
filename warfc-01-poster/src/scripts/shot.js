const { chromium } = require('playwright');
(async () => {
  const [,, html, out, w, h, dpr] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +(dpr || 1) });
  await p.goto('file://' + require('path').resolve(html));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: false });
  await b.close();
})();
