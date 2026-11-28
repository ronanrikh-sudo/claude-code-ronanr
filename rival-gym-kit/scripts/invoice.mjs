// Rival Gym × CAGECRAFT invoice (A4 PDF + PNG preview), in the CAGECRAFT house invoice format,
// upgraded with the kit mockups and the Legacy hem pattern.
// Private payment details are read from invoice/private.json (gitignored). Output: out/invoice/ (gitignored).
// node scripts/invoice.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from './pw.mjs';
import { emblem, IDEAS, RED } from './emblem.mjs';
import { patternPath } from './pattern.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'invoice/private.json'), 'utf8'));
const OUT = path.join(ROOT, 'out/invoice');
fs.mkdirSync(OUT, { recursive: true });

// ---- order ------------------------------------------------------------------------------------
const INV = {
  no: 'CC2026032',
  date: '28/11/2026',
  due: 'On receipt',
  title: 'Rival Gym Team Kit',
  billTo: ['Rival Gym · Castle Hill', 'Attn: Laz Mirdjonov', 'castle.hill@rivalgym.com.au'],
};
const ITEMS = [
  { name: 'Rashguard', desc: 'Idea A · short sleeve · red &amp; white on black · full sublimation', img: 'rashguard_A', price: 24.5, qty: 51, fightwear: true, sizes: [3, 4, 11, 13, 12, 6, 2] },
  { name: 'MMA Shorts', desc: 'Idea A · non-velcro curved cut · full sublimation', img: 'shorts_A', price: 26.0, qty: 51, fightwear: true, sizes: [3, 4, 11, 13, 12, 6, 2] },
  { name: 'Training Tee', desc: 'Black tee · white print · front chest + back neck', img: 'tee_B2', price: 20.0, qty: 100, fightwear: false, sizes: [4, 12, 21, 22, 21, 13, 7] },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const MAJOR = new Set(['M', 'L', 'XL']);
for (const i of ITEMS) {
  const n = i.sizes.reduce((a, b) => a + b, 0);
  if (n !== i.qty) throw new Error(`${i.name}: sizes add to ${n}, qty is ${i.qty}`);
}
const FEE_RATE = 0.10; // CAGECRAFT service fee on all goods (not freight)
const FREIGHT = 700; // international freight, door to door, fixed

const money = (n) => '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const lines = ITEMS.map((i) => ({ ...i, total: i.price * i.qty }));
const goods = lines.reduce((a, i) => a + i.total, 0);
const feeBase = goods;
const fee = Math.round(feeBase * FEE_RATE * 100) / 100;
const grand = goods + fee + FREIGHT;
// all-in per unit = price + 10% fee + an even share of freight; last orders: CC2026001/CC2026011
// (fightwear: unit + 10% fee + $450 DHL over 102 pcs) and CC2026030 (tees: $20 + $130 DHL over 70)
const LAST_PRICE = { Rashguard: 24.49, 'MMA Shorts': 26.0, 'Training Tee': 20.0 };
const LAST = { Rashguard: 24.49 * 1.1 + 450 / 102, 'MMA Shorts': 26.0 * 1.1 + 450 / 102, 'Training Tee': 20 + 130 / 70 };
const pcs = lines.reduce((a, i) => a + i.qty, 0);
for (const i of lines) {
  i.allIn = i.price * (1 + FEE_RATE) + FREIGHT / pcs;
  i.saveExact = LAST[i.name] - i.allIn;
  i.save = Math.round(i.saveExact * 100) / 100;
}
const saved = lines.filter((i) => i.save > 0);
const savedTotal = Math.round(saved.reduce((a, i) => a + i.saveExact * i.qty, 0) * 100) / 100;

// ---- assets -----------------------------------------------------------------------------------
const b64 = (p) => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
const cut = (n) => b64(path.join(ROOT, 'out/products/cutouts_cropped', `${n}.png`));
const EMB = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/cagecraft_emblem.json'), 'utf8')).EMBLEM;
const ccEmblem = (w, fill = '#fff') => {
  const [x0, y0, x1, y1] = EMB.bbox;
  return `<svg viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" width="${w}" style="display:block"><path d="${EMB.d}" fill="${fill}" fill-rule="evenodd"/></svg>`;
};
const rivalOval = (w) => `<svg viewBox="-640 -240 1180 480" width="${w}" style="display:block">${emblem(IDEAS.B2)}</svg>`;
const hem = (() => {
  const w = 900, h = 96, unit = 7;
  const d = patternPath({ width: w, height: h, unit, cx: w / 2, vStretch: h / (31 * unit) });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:-53px;bottom:0">
    <defs><linearGradient id="hf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="hm" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="url(#hf)"/></mask></defs>
    <path d="${d}" stroke="${RED}" stroke-width="2.2" fill="none" mask="url(#hm)"/></svg>`;
})();

// ---- page -------------------------------------------------------------------------------------
const CSS = `
  @page { size: A4; margin: 0 }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  html, body { width: 794px; height: 1123px; background: #fff }
  body { font-family: Inter, sans-serif; color: #141414; -webkit-font-smoothing: antialiased }
  .page { position: relative; width: 794px; height: 1123px; overflow: hidden }
  .hdr { position: relative; height: 214px; background: radial-gradient(ellipse 70% 90% at 30% 20%, #1b1b1b 0%, #0b0b0b 70%); color: #f4f4f2; overflow: hidden; padding: 30px 52px 0 }
  .kick { font: 600 9.5px/1 Inter; letter-spacing: .26em; text-transform: uppercase; color: #9a9a98 }
  .big { font: 900 54px/0.95 'Inter Display', Inter; letter-spacing: -.01em; margin-top: 12px }
  .sub { font: 600 13px/1.4 Inter; color: #e2e2e0; margin-top: 10px }
  .invno { font: 700 12px/1 Inter; letter-spacing: .08em; color: #fff; margin-top: 10px }
  .invno span { color: ${RED} }
  .co { position: absolute; right: 52px; top: 30px; text-align: right; font: 500 10.5px/1.7 Inter; color: #c8c8c6 }
  .co b { display: block; font: 800 15px/1 'Inter Display', Inter; letter-spacing: .06em; color: #fff; margin: 4px 0 10px }
  .lock { display: flex; align-items: center; gap: 10px; margin-top: 2px }
  .lock .x { font: 300 16px/1 Inter; color: #8a8a88 }
  .body { padding: 22px 52px 0 }
  .meta { display: grid; grid-template-columns: 1.05fr 1.05fr 1.1fr; gap: 22px; align-items: start }
  .lbl { font: 700 8.5px/1 Inter; letter-spacing: .22em; text-transform: uppercase; color: #8a8a88; margin-bottom: 7px }
  .val { font: 500 11px/1.55 Inter; color: #222 }
  .val b { font-weight: 700; color: #111 }
  .gt { text-align: right }
  .gt .amt { font: 900 34px/1 'Inter Display', Inter; letter-spacing: -.01em; margin-top: 4px }
  .gt .cur { font: 600 10px/1 Inter; color: #8a8a88; margin-top: 6px }
  .sz { width: 100%; border-collapse: separate; border-spacing: 0 5px; margin-top: 10px }
  .sz th { font: 700 8px/1 Inter; letter-spacing: .14em; text-transform: uppercase; color: #8a8a88; text-align: center; padding: 0 0 2px; border: 0 }
  .sz th.l { text-align: left }
  .sz td { background: #f2f2f0; text-align: center; font: 600 11px/1 Inter; color: #333; padding: 0; height: 34px; border: 0 }
  .sz td.p { text-align: left; border-radius: 9px 0 0 9px; padding-left: 8px }
  .sz td.t { border-radius: 0 9px 9px 0; font-weight: 800; color: #111 }
  .sz td.m { background: #e6e6e3; font-weight: 800; color: #111 }
  .sz .pr { display: flex; align-items: center; gap: 10px }
  .sz img { max-width: 28px; max-height: 28px; display: block }
  .sz .pn { font: 800 10px/1.2 'Inter Display', Inter; letter-spacing: .06em; text-transform: uppercase }
  .szn { font: 500 9px/1.3 Inter; color: #8a8a88; margin-top: 1px }
  .same { display: inline-block; margin: 0 0 0 10px; vertical-align: 1px; padding: 2px 8px 2px 7px; border-radius: 20px; border: 1.2px solid #1E9E52; color: #177A43; font: 700 9.5px/1.2 Inter }
  .card { flex: 1; background: #f2f2f0; border-radius: 10px; padding: 8px 12px; display: flex; align-items: center; gap: 10px }
  .card .im { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center }
  .card img { max-width: 56px; max-height: 56px; display: block }
  .card .n { font: 800 11px/1.2 'Inter Display', Inter; letter-spacing: .06em; text-transform: uppercase }
  .card .q { font: 500 10px/1.35 Inter; color: #555; margin-top: 3px }
  table { width: 100%; border-collapse: collapse; margin-top: 12px }
  .it-t th { font: 700 8.5px/1 Inter; letter-spacing: .2em; text-transform: uppercase; color: #8a8a88; text-align: left; padding: 0 0 9px; border-bottom: 1.5px solid #141414 }
  .it-t th.r, .it-t td.r { text-align: right }
  .it-t td { padding: 7px 0; border-bottom: 1px solid #e3e3e1; font: 500 11px/1.4 Inter; vertical-align: top }
  td .it { font: 700 12px/1.3 Inter; color: #111 }
  td .ds { font: 500 9.5px/1.4 Inter; color: #777; margin-top: 2px }
  .it-t tr.sep td { border-bottom: 1.5px solid #141414 }
  .tot { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px }
  .panel { width: 340px; background: #f2f2f0; border-radius: 10px; padding: 12px 16px }
  .panel .lbl { margin-bottom: 9px }
  .tick { display: flex; gap: 8px; font: 500 10.5px/1.45 Inter; color: #222; margin-top: 5px }
  .tick i { flex: none; width: 14px; height: 14px; border-radius: 50%; background: ${RED}; margin-top: 1px; position: relative }
  .tick i::after { content: ''; position: absolute; left: 4.5px; top: 2.5px; width: 3px; height: 6px; border: solid #fff; border-width: 0 1.6px 1.6px 0; transform: rotate(45deg) }
  .sums { width: 270px }
  .sums .row { display: flex; justify-content: space-between; font: 500 11px/1 Inter; color: #333; padding: 6px 0 }
  .sums .grand { border-top: 1.5px solid #141414; margin-top: 6px; padding-top: 11px; font: 900 18px/1 'Inter Display', Inter; color: #111 }
  .pay { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e3e3e1 }
  .kv { display: grid; grid-template-columns: 92px 1fr; font: 500 10.5px/1.75 Inter; color: #222 }
  .kv span:nth-child(odd) { color: #8a8a88 }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; margin: 12px 52px 0; padding-top: 12px; border-top: 1px solid #e3e3e1 }
  .thanks { font: 500 10px/1.55 Inter; color: #555; max-width: 330px }
  .sig { text-align: right }
  .sig b { display: block; font: 800 12px/1.2 'Inter Display', Inter }
  .sig span { font: 500 10px/1.4 Inter; color: #777 }
  .save { display: inline-block; margin: 0 0 0 10px; vertical-align: 1px; padding: 3px 8px 3px 7px; border-radius: 20px; background: #E6F5EC; color: #177A43; font: 700 9.5px/1.2 Inter }
  .tick.g { color: #177A43; font-weight: 700 }
  .tick.g i { background: #1E9E52 }
  .band { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: ${RED} }
`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="page">
  <div class="hdr">
    ${hem}
    <div class="lock">${rivalOval(84)}<span class="x">×</span>${ccEmblem(46)}</div>
    <div class="big">INVOICE</div>
    <div class="sub">${INV.title} · Rashguards, MMA Shorts &amp; Training Tees</div>
    <div class="invno">INVOICE NO. <span>${INV.no}</span></div>
    <div class="co"><b>CAGECRAFT CO</b>info@cagecraftco.com<br>www.cagecraftco.com<br>@cagecraftco<br>ABN ${P.abn}</div>
  </div>
  <div class="body">
    <div class="meta">
      <div><div class="lbl">Invoice date</div><div class="val">${INV.date}</div>
        <div class="lbl" style="margin-top:12px">Due</div><div class="val">${INV.due}</div></div>
      <div><div class="lbl">Billed to</div><div class="val"><b>${INV.billTo[0]}</b><br>${INV.billTo.slice(1).join('<br>')}</div></div>
      <div class="gt"><div class="lbl">Grand total</div><div class="amt">${money(grand)}</div><div class="cur">AUD · payment in full</div></div>
    </div>
    <table class="sz">
      <tr><th class="l">Your order · size breakdown</th>${SIZES.map((z) => `<th>${z}</th>`).join('')}<th>Total</th></tr>
      ${lines.map((i) => `<tr><td class="p"><div class="pr"><img src="${cut(i.img)}"><span class="pn">${i.name}</span></div></td>${i.sizes.map((n, k) => `<td class="${MAJOR.has(SIZES[k]) ? 'm' : ''}">${n}</td>`).join('')}<td class="t">${i.qty}</td></tr>`).join('')}
    </table>
    <div class="szn">Mostly M, L &amp; XL as requested, with a spread across the other sizes, including XS for female members. Let us know any changes before production starts.</div>
    <table class="it-t">
      <tr><th>Item</th><th class="r">Price</th><th class="r">Qty</th><th class="r">Total</th></tr>
      ${lines.map((i) => `<tr><td><div class="it">${i.name}${i.save > 0 ? `<span class="save">≈ $${Math.max(1, Math.round(i.save))} less per unit than your last order (all-in)</span>` : i.price === LAST_PRICE[i.name] ? `<span class="same">Same unit price as your last order</span>` : ''}</div><div class="ds">${i.desc}</div></td><td class="r">${money(i.price)}</td><td class="r">${i.qty}</td><td class="r">${money(i.total)}</td></tr>`).join('')}
      <tr><td><div class="it">CAGECRAFT service fee</div><div class="ds">10% of goods · design, production management &amp; quality control</div></td><td class="r">10%</td><td class="r">—</td><td class="r">${money(fee)}</td></tr>
      <tr class="sep"><td><div class="it">International freight</div><div class="ds">Door to door · fixed price, nothing added on arrival</div></td><td class="r">${money(FREIGHT)}</td><td class="r">1</td><td class="r">${money(FREIGHT)}</td></tr>
    </table>
    <div class="tot">
      <div class="panel"><div class="lbl">This order</div>
        <div class="tick"><i></i><div>Same unit prices as your last orders</div></div>
        ${saved.length ? `<div class="tick g"><i></i><div>Fightwear ≈ $1 cheaper per unit vs your last order</div></div>` : ''}
        <div class="tick"><i></i><div>Freight fixed upfront, so nothing is added later</div></div>
        <div class="tick"><i></i><div>Custom kit design and mockups included</div></div>
        <div class="tick"><i></i><div>Production starts once payment is received</div></div>
      </div>
      <div class="sums">
        <div class="row"><span>Goods</span><span>${money(goods)}</span></div>
        <div class="row"><span>Service fee (10% of goods)</span><span>${money(fee)}</span></div>
        <div class="row"><span>Freight</span><span>${money(FREIGHT)}</span></div>
        <div class="row grand"><span>Grand total</span><span>${money(grand)}</span></div>
      </div>
    </div>
    <div class="pay">
      <div><div class="lbl">Payable to</div><div class="kv"><span>Name</span><span>${P.payableName}</span><span>Phone</span><span>${P.phone}</span><span>ABN</span><span>${P.abn}</span></div></div>
      <div><div class="lbl">Payment detail</div><div class="kv"><span>Account name</span><span>${P.accountName}</span><span>Bank</span><span>${P.bank}</span><span>BSB</span><span>${P.bsb}</span><span>Account</span><span>${P.account}</span><span>Reference</span><span><b>${INV.no}</b></span></div></div>
    </div>
  </div>
  <div class="foot">
    <div class="thanks">Thank you for choosing us as your partner. We greatly appreciate your support and look forward to continuing to work together in the future.</div>
    <div class="sig"><b>Ronan Rikh</b><span>Founder, CAGECRAFT</span></div>
  </div>
  <div class="band"></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const base = path.join(OUT, `${INV.no}-Rival-Gym-Team-Kit`);
await page.screenshot({ path: base + '.png' });
await page.pdf({ path: base + '.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`goods ${money(goods)} fee ${money(fee)} freight ${money(FREIGHT)} grand ${money(grand)}`);
for (const i of lines) console.log(`${i.name}: all-in ${money(i.allIn)} vs last ${money(LAST[i.name])} -> save ${money(i.save)}`);
console.log(`fightwear saving shown: ${money(savedTotal)}`);
console.log('wrote', base + '.pdf');
