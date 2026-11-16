#!/usr/bin/env node
// Render an ad HTML page to a still, and record where every real-product image landed.
//
//   node kit/render-static.mjs ads/<id>/ad.html [--size 1080x1350] [--scale 2] [--out ads/<id>/out/<name>] [--query "v=2"]
//
// Writes <out>.png (lossless, for fidelity-check), <out>.jpg (q92 deliverable) and <out>.placements.json.
// Any <img data-product="library-relative/path/to/cutout.png"> is recorded with its on-canvas box and
// rotation so kit/fidelity-check.py can prove the garment pixels match the source photograph.
// Any element with data-photo="library-relative/path.jpg" is logged as a real photograph (crop only).
// Any element with data-ai="what it is" is logged as AI-generated (must never contain the garment).
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright"); // pre-installed globally in this environment

const args = process.argv.slice(2);
if (!args[0]) { console.error("usage: render-static.mjs <page.html> [--size WxH] [--scale N] [--out base] [--query q]"); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const page_path = path.resolve(args[0]);
const [W, H] = opt("--size", "1080x1350").split("x").map(Number);
const scale = Number(opt("--scale", "2"));
const base = path.resolve(opt("--out", path.join(path.dirname(page_path), "out", path.basename(page_path, ".html"))));
fs.mkdirSync(path.dirname(base), { recursive: true });

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("requestfailed", (r) => errors.push("request failed: " + r.url()));
const q = opt("--query", "");
await page.goto(pathToFileURL(page_path).href + (q ? "?" + q : ""), { waitUntil: "load" });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
});
await page.waitForTimeout(250);

const report = await page.evaluate(({ W, H }) => {
  const out = { canvas: { width: W, height: H }, products: [], photos: [], ai: [], warnings: [] };
  const sw = document.documentElement.scrollWidth, sh = document.documentElement.scrollHeight;
  if (sw > W + 1 || sh > H + 1) out.warnings.push(`page overflows the canvas (${sw}x${sh} > ${W}x${H})`);
  for (const el of document.querySelectorAll("img[data-product]")) {
    // accumulate rotation + scale through ancestors
    let m = new DOMMatrix();
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const t = getComputedStyle(n).transform;
      if (t && t !== "none") m = new DOMMatrix(t).multiply(m);
      const cs = getComputedStyle(n);
      if (n !== el && cs.filter !== "none" && !/drop-shadow/.test(cs.filter)) out.warnings.push(`ancestor of product has filter: ${cs.filter}`);
      if (Number(cs.opacity) < 1) out.warnings.push("product (or ancestor) has opacity < 1");
      if (cs.mixBlendMode !== "normal") out.warnings.push("product (or ancestor) has mix-blend-mode");
    }
    const rot = Math.atan2(m.b, m.a) * 180 / Math.PI;
    const sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const natural = el.naturalWidth / el.naturalHeight, boxed = el.offsetWidth / el.offsetHeight;
    if (Math.abs(natural / boxed - 1) > 0.01) out.warnings.push(`product ${el.dataset.product} is not shown at its natural aspect ratio (${natural.toFixed(3)} vs ${boxed.toFixed(3)})`);
    if (Math.abs(sx / sy - 1) > 0.01) out.warnings.push(`product ${el.dataset.product} has non-uniform scale`);
    if (cs.objectFit !== "fill" && cs.objectFit !== "contain") out.warnings.push(`product ${el.dataset.product} uses object-fit:${cs.objectFit}`);
    out.products.push({ src: el.dataset.product, x: r.x, y: r.y, w: r.width, h: r.height, rotation: rot, flipX: m.a * m.d - m.b * m.c < 0, drawnWidth: el.offsetWidth * sx, naturalWidth: el.naturalWidth, upscale: (el.offsetWidth * sx) / el.naturalWidth });
  }
  for (const el of document.querySelectorAll("[data-photo]")) { const r = el.getBoundingClientRect(); out.photos.push({ src: el.dataset.photo, x: r.x, y: r.y, w: r.width, h: r.height }); }
  for (const el of document.querySelectorAll("[data-ai]")) { const r = el.getBoundingClientRect(); out.ai.push({ what: el.dataset.ai, x: r.x, y: r.y, w: r.width, h: r.height }); }
  return out;
}, { W, H });
report.scale = scale;
report.errors = errors;

await page.screenshot({ path: base + ".png", clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", base + ".png", "-q:v", "2", "-pix_fmt", "yuvj444p", base + ".jpg"]);
fs.writeFileSync(base + ".placements.json", JSON.stringify(report, null, 2));
console.log(`${path.relative(process.cwd(), base)}.png  ${W * scale}x${H * scale}  products:${report.products.length} photos:${report.photos.length} ai:${report.ai.length}`);
for (const w of [...report.warnings, ...errors]) console.log("  WARNING: " + w);
for (const p of report.products) if (p.upscale > 1.15 / scale * scale) console.log(`  note: ${p.src} drawn at ${(p.upscale * 100).toFixed(0)}% of native size`);
