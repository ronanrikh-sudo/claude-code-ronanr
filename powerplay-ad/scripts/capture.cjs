// Capture the real PowerPlay flow on the LIVE site at iPhone resolution (no edits to the UI).
// Fresh visitor, empty cart -> Add to cart -> drawer offer -> tap PowerPlay -> PowerPlayed.
const pw = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/../public/shots/';
(async () => {
  const b = await pw.chromium.launch();
  const ctx = await b.newContext({ ...pw.devices['iPhone 13'] }); // 390x664 viewport @3x in Playwright's profile
  await ctx.addInitScript(() => { try { localStorage.setItem('ccGiveaway_v1', JSON.stringify({ dismissedUntil: Date.now() + 864e5 })); } catch (e) {} });
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 390, height: 844 }); // full iPhone 13 screen height
  await p.goto('https://www.cagecraftco.com/products/heavy-hitters-tee', { waitUntil: 'load', timeout: 60000 });
  await p.getByRole('button', { name: 'Accept' }).click({ timeout: 4000 }).catch(() => {});
  await p.waitForTimeout(3500);
  const theme = await p.evaluate(() => (window.Shopify && Shopify.theme && Shopify.theme.name) || '?');
  console.log('live theme:', theme);
  await p.screenshot({ path: OUT + '01-product.png' });
  const atc = p.locator('product-form button[type="submit"], button[name="add"]').first();
  const atcBox = await atc.boundingBox();
  await atc.tap();
  await p.waitForTimeout(5000);
  const boxes = async () => p.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(v => Math.round(v * 10) / 10); };
    const m = document.querySelector('#cart-modal');
    const lines = [...m.querySelectorAll('.cart-item, [data-cart-item-index], li')].filter(x => x.getBoundingClientRect().height > 40);
    const line = (re) => r(lines.find(l => re.test(l.innerText || '')));
    const total = [...m.querySelectorAll('*')].find(e => /^Total$/.test((e.innerText || '').trim()));
    return {
      drawer: r(m.querySelector('[slot="content"]') || m), bar: r(m.querySelector('lb-cart-progress-bar')),
      pp: r(m.querySelector('[data-cc-pp]')), btn: r(m.querySelector('[data-cc-pp-go]')), odds: r(m.querySelector('.cc-pp__odds')),
      fine: r(m.querySelector('.cc-pp__fine')), tee: line(/Heavy Hitters/), boost: line(/PowerPlay Boost/), kit: line(/Kit Bag/),
      totalRow: r(total && total.parentElement), state: (m.querySelector('[data-cc-pp]') || {}).getAttribute && m.querySelector('[data-cc-pp]').getAttribute('data-state'),
      barText: (m.querySelector('lb-cart-progress-bar') || {}).innerText,
    };
  });
  const offer = await boxes();
  console.log('offer:', JSON.stringify(offer));
  await p.screenshot({ path: OUT + '02-drawer-offer.png' });
  // a few frames of the live shimmer on the button
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(280); await p.screenshot({ path: OUT + `02-shine-${i}.png`, clip: { x: 0, y: 0, width: 390, height: 844 } }); }
  const btn = offer.btn;
  await p.touchscreen.tap(btn[0] + btn[2] * 0.62, btn[1] + btn[3] / 2);
  await p.waitForTimeout(120);
  await p.screenshot({ path: OUT + '03-drawer-loading.png' });
  let active = null;
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); const s = await p.evaluate(() => (document.querySelector('#cart-modal [data-cc-pp]') || {}).getAttribute && document.querySelector('#cart-modal [data-cc-pp]').getAttribute('data-state')); if (s === 'active') { active = i; break; } }
  console.log('active after ~', (active + 1) * 100 + 120, 'ms');
  await p.screenshot({ path: OUT + '04-drawer-active-pre.png' });
  await p.waitForTimeout(4000);
  const done = await boxes();
  console.log('active:', JSON.stringify(done));
  await p.screenshot({ path: OUT + '05-drawer-active.png' });
  const cart = await p.evaluate(async () => { const c = await (await fetch('/cart.js?t=' + Date.now())).json(); return { total: c.total_price, items: c.items.map(i => [i.product_title, i.variant_title, i.final_line_price]) }; });
  console.log('cart:', JSON.stringify(cart));
  fs.writeFileSync(OUT + 'boxes.json', JSON.stringify({ dpr: 3, viewport: [390, 844], atc: atcBox, offer, active: done, cart }, null, 1));
  await b.close();
})();
