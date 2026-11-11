// Renders the size-label note card: print-shop PDF (black, A6 + 3mm bleed), cut-at-home A4 sheet
// (white, 4-up) and PNG previews. Usage: node render.mjs [CODE]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // global install
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const CODE = process.argv[2] || "LABEL10";
const css = fs.readFileSync(path.join(dir, "card.css"), "utf8");

const card = (cls, bleed) => `
<div class="card ${cls}" style="--bleed:${bleed}mm">
  <img class="logo" src="logo-white.png" alt="CAGECRAFT">
  <div class="eyebrow">A note from us</div>
  <h1>About your<br>size label.</h1>
  <div class="rule"></div>
  <p>Our custom woven labels didn&rsquo;t make it onto this run, so your tee has a plain size tag instead.</p>
  <p>Everything else is exactly as we designed it. But the details matter to us.</p>
  <p><b>So your next order is $10 off, on us.</b></p>
  <div class="offer">
    <div><div class="k">Use code at checkout</div><div class="v">$10 off</div></div>
    <div class="code">${CODE}</div>
  </div>
  <div class="foot"><span>cagecraftco.com</span><span>One use per customer</span></div>
</div>`;

const page = (w, h, body) => `<!doctype html><html><head><meta charset="utf-8"><base href="file://${dir}/">
<style>${css}@page{size:${w}mm ${h}mm;margin:0}body{width:${w}mm;height:${h}mm}
.sheet{display:grid;grid-template-columns:105mm 105mm;position:relative}
.sheet .card{height:148.5mm}
.cut{position:absolute;border:0 dashed #bbb}.cut.v{left:105mm;top:0;height:297mm;border-left-width:.2mm}.cut.h{top:148.5mm;left:0;width:210mm;border-top-width:.2mm}
</style></head><body>${body}</body></html>`;

const jobs = [
  { name: "cagecraft-label-card-black-A6-bleed", w: 111, h: 154, body: card("", 3) },
  { name: "cagecraft-label-card-black", w: 105, h: 148, body: card("", 0), png: true, pdf: false },
  // 5mm bleed per edge: the 115 x 158mm upload size online printers ask for on A6.
  { name: "cagecraft-label-card-black-A6-115x158", w: 115, h: 158, body: card("", 5) },
  { name: "cagecraft-label-card-white-A6-115x158", w: 115, h: 158, body: card("light", 5) },
  { name: "cagecraft-label-card-black-A6", w: 105, h: 148, body: card("", 0) },
  { name: "cagecraft-label-card-white", w: 105, h: 148, body: card("light", 0), png: true, pdf: false },
  { name: "cagecraft-label-card-white-A6", w: 105, h: 148, body: card("light", 0) },
  { name: "cagecraft-label-card-white-A4-4up", w: 210, h: 297, body: `<div class="sheet">${card("light", 0).repeat(4)}<i class="cut v"></i><i class="cut h"></i></div>` },
];

const browser = await chromium.launch();
for (const j of jobs) {
  const tmp = path.join(dir, `.${j.name}.html`);
  fs.writeFileSync(tmp, page(j.w, j.h, j.body));
  const mm = (v) => Math.round((v * 96) / 25.4);
  const ctx = await browser.newContext({ viewport: { width: mm(j.w), height: mm(j.h) }, deviceScaleFactor: 300 / 96 });
  const p = await ctx.newPage();
  await p.goto(`file://${tmp}`);
  await p.evaluate(() => document.fonts.ready);
  if (j.pdf !== false) await p.pdf({ path: path.join(dir, "out", `${j.name}.pdf`), width: `${j.w}mm`, height: `${j.h}mm`, printBackground: true });
  if (j.png) await p.screenshot({ path: path.join(dir, "out", `${j.name}.png`) });
  await ctx.close();
  fs.unlinkSync(tmp);
}
await browser.close();
console.log("done, code:", CODE);
