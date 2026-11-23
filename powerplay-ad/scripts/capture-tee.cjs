// Real PowerPlay flow on the LIVE site to the $250 tier (free Essentials Training Tee 2.0), iPhone 13 @3x.
// Cart: Fight Jersey Diamond + Walkout Hoodie Diamond + Monarch LS Rashguard, then Boxer Oversized Tee Diamond via the real button.
const pw = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/../public/shots-tee/';
const PRE = ['fight-jersey-2-0-diamond', 'walkout-hoodie-diamond', 'monarch-rashguard'];
const LAST = 'boxer-oversized-tee-tiffany';
const Q = '?preview_theme_id=' + (process.env.THEME || '190194614334');
(async () => {
  const b = await pw.chromium.launch();
  const ctx = await b.newContext({ ...pw.devices['iPhone 13'] });
  await ctx.addInitScript(() => { try { localStorage.setItem('ccGiveaway_v1', JSON.stringify({ dismissedUntil: Date.now() + 864e5 })); } catch (e) {} });
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('https://www.cagecraftco.com/' + Q, { waitUntil: 'load', timeout: 60000 });
  await p.getByRole('button', { name: 'Accept' }).click({ timeout: 4000 }).catch(() => {});
  const added = await p.evaluate(async (handles) => {
    const out = [];
    const get = async (u) => { for (let i = 0; i < 6; i++) { const r = await fetch(u); if (r.ok) return r.json(); await new Promise(z => setTimeout(z, 1500 * (i + 1))); } throw new Error('failed ' + u); };
    for (const h of handles) {
      const pr = await get('/products/' + h + '.js');
      const v = pr.variants.find(x => x.available && x.title === 'M') || pr.variants.find(x => x.available);
      const r = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: v.id, quantity: 1 }] }) });
      out.push(pr.title + ' [' + v.title + '] ' + r.status);
    }
    return out;
  }, PRE);
  console.log('pre-added:', added.join(' | '));
  await p.goto('https://www.cagecraftco.com/products/' + LAST + Q, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3000);
  await p.getByRole('radio', { name: 'M', exact: true }).first().check({ force: true, timeout: 3000 }).catch(() => console.log('size M radio not found, using default'));
  await p.waitForTimeout(700);
  await p.locator('product-form button[type="submit"], button[name="add"]').first().tap();
  await p.waitForTimeout(8000);   // drawer opens; gift app adds the lower-tier gifts and redraws

  // like a shopper: pick each free gift's option (towel design, socks colour, tee size) so the cart is complete
  const pickGifts = async () => {
    for (let round = 0; round < 4; round++) {
      const sel = await p.evaluate(() => {
        const s = [...document.querySelectorAll('#cart-modal select')].find(x => x.getBoundingClientRect().width > 0 && !x.value);
        if (!s) return null; s.setAttribute('data-pick', '1'); return [...s.options].map(o => o.value);
      });
      if (!sel) return;
      const val = sel.find(v => v === 'M') || sel.find(v => v === 'White') || sel.find(v => v);
      await p.selectOption('#cart-modal select[data-pick="1"]', val).catch(() => {});
      await p.waitForTimeout(3000);
    }
  };
  const hidePreviewBar = () => p.addStyleTag({ content: '#PBarNextFrameWrapper, #preview-bar-iframe, iframe[id*="preview-bar"] { display: none !important; }' });
  const boxes = () => p.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(v => Math.round(v * 10) / 10); };
    const m = document.querySelector('#cart-modal');
    const items = [...m.querySelectorAll('[data-cart-item-index], .cart-item')].filter(x => x.getBoundingClientRect().height > 40)
      .map(x => ({ t: (x.innerText || '').split('\n')[0].trim().slice(0, 40), box: r(x) }));
    const heading = [...m.querySelectorAll('*')].find(e => /^Complete your fit$/.test((e.innerText || '').trim()));
    const totalLbl = [...m.querySelectorAll('*')].find(e => /^Total$/.test((e.innerText || '').trim()));
    const pp = m.querySelector('[data-cc-pp]');
    return { bar: r(m.querySelector('lb-cart-progress-bar')), barText: (m.querySelector('lb-cart-progress-bar') || {}).innerText,
      pp: r(pp), state: pp && pp.getAttribute('data-state'), ppText: pp && pp.innerText.replace(/\s+/g, ' ').slice(0, 90), btn: r(m.querySelector('[data-cc-pp-go]')),
      items, upsellHeading: r(heading), total: r(totalLbl && totalLbl.parentElement), scrollTop: (m.querySelector('#CartModal-ScrollBody') || {}).scrollTop };
  });
  await pickGifts();
  await hidePreviewBar();
  await p.waitForTimeout(800);
  const offer = await boxes();
  console.log('offer:', JSON.stringify(offer));
  await p.screenshot({ path: OUT + '02-offer.png' });
  // scrolled view for "Don't add another item": bring the upsell into view, then back to the top
  const scrolled = await p.evaluate(() => {
    const sb = document.querySelector('#CartModal-ScrollBody'); const h = [...document.querySelectorAll('#cart-modal *')].find(e => /^Complete your fit$/.test((e.innerText || '').trim()));
    if (!sb || !h) return null; sb.scrollTop += h.getBoundingClientRect().top - 330; return sb.scrollTop;
  });
  await p.waitForTimeout(600);
  const up = await boxes();
  console.log('upsell view (scrollTop ' + scrolled + '):', JSON.stringify({ upsellHeading: up.upsellHeading, items: up.items.slice(-3) }));
  await p.screenshot({ path: OUT + '01-upsell.png' });
  await p.evaluate(() => { const sb = document.querySelector('#CartModal-ScrollBody'); if (sb) sb.scrollTop = 0; });
  await p.waitForTimeout(600);
  const btn = (await boxes()).btn;
  if (!btn) { console.log('NO POWERPLAY BUTTON'); await b.close(); return; }
  await p.touchscreen.tap(btn[0] + btn[2] * 0.62, btn[1] + btn[3] / 2);
  await p.waitForTimeout(120);
  await p.screenshot({ path: OUT + '03-loading.png' });
  await p.waitForTimeout(9000);   // boost lands, gift app adds the tee and redraws
  await pickGifts();
  await hidePreviewBar();
  await p.waitForTimeout(800);
  const done = await boxes();
  console.log('active:', JSON.stringify(done));
  await p.screenshot({ path: OUT + '05-active.png' });
  const cart = await p.evaluate(async () => { const c = await (await fetch('/cart.js?t=' + Date.now())).json(); return { total: c.total_price, items: c.items.map(i => [i.product_title, i.variant_title, i.final_line_price]) }; });
  console.log('cart:', JSON.stringify(cart));
  fs.writeFileSync(OUT + 'boxes.json', JSON.stringify({ offer, upsell: up, upsellScroll: scrolled, active: done, cart }, null, 1));
  await b.close();
})();
