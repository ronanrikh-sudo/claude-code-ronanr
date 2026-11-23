// Renders the "Gifts sorted for him" ads from gifts.json + products.json.
//   out/gifts/<concept>-<variant>-4x5.png   1080x1350 feed
//   out/gifts/<concept>-<variant>-9x16.png  1080x1920 Stories/Reels (same layout inside the safe area)
//   out/gifts/budget-<n>-<id>-1x1.png       1080x1080 carousel cards ("gift guide by budget")
// Usage: node scripts/render-gifts.mjs [--only hero|versus|list|persona|budget]
import { readFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "out/gifts");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const want = (k) => !only || only === k;

const G = JSON.parse(await readFile(path.join(ROOT, "gifts.json"), "utf8"));
const { products } = JSON.parse(await readFile(path.join(ROOT, "products.json"), "utf8"));
const url = (p) => pathToFileURL(path.join(ROOT, p)).href;
const exists = (f) => access(f).then(() => true, () => false);

const SHORT = {
  "jersey-tiffany": "Fight Jersey", "jersey-diamond": "Fight Jersey", "jersey-cottoncandy": "Fight Jersey",
  "hoodie-diamond": "Walkout Hoodie", "hoodie-concrete": "Walkout Hoodie", "hoodie-cottoncandy": "Walkout Hoodie",
  "shorts-legacy": "Legacy Shorts", "tee-menace": "Oversized Tee", "towel": "Training Towel", "socks": "Crew Socks",
};
const CUT = {
  "jersey-tiffany": "assets/cutouts/cut-jersey-tiffany.png", "jersey-cottoncandy": "assets/cutouts/cut-jersey-cottoncandy.png",
  "hoodie-diamond": "assets/cutouts/cut-hoodie-diamond.png", "hoodie-cottoncandy": "assets/cutouts/cut-hoodie-cottoncandy.png",
  "shorts-legacy": "assets/cutouts/cut-shorts-legacy.png", "socks": "assets/cutouts/cut-socks.png",
};
// Budget tiers: the smallest round number at or above the price shown.
const TIERS = [20, 25, 30, 40, 50, 60, 65, 70, 80, 85, 90, 100, 110, 120, 150];

async function product(id, extra = {}) {
  const p = products[id];
  if (!p) throw new Error(`Unknown product ${id}`);
  let src = null;
  for (const ext of ["jpg", "png"]) if (await exists(path.join(ROOT, `assets/img/${id}.${ext}`))) { src = url(`assets/img/${id}.${ext}`); break; }
  const shown = G.sale.on && p.sale != null ? p.sale : p.price;
  return { ...p, ...extra, id, src, short: SHORT[id] || p.name, cut: CUT[id] ? url(CUT[id]) : null, tier: TIERS.find((t) => t >= shown) };
}

const RATIOS = { "4x5": { h: 1350, safe: { top: 0, bottom: 0 } }, "9x16": { h: 1920, safe: { top: 250, bottom: 340 } } };
const base = { logo: url("assets/logo-white.png"), sale: G.sale, cta: G.cta };

const browser = await chromium.launch();
async function shot(data, h, file) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript((d) => { window.__DATA__ = d; }, { ...base, ...data, height: h });
  const page = await ctx.newPage();
  await page.goto(url("src/gifts.html"));
  const info = await page.evaluate(() => window.__ready);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: h } });
  await ctx.close();
  console.log(path.relative(ROOT, file) + (info.overflowing ? `  (WARNING: ${info.overflowing} overflowing blocks)` : ""));
}
async function both(name, data) {
  for (const [r, { h, safe }] of Object.entries(RATIOS)) await shot({ ...data, safe }, h, path.join(OUT, `${name}-${r}.png`));
}

await mkdir(OUT, { recursive: true });

if (want("hero")) {
  const tiles = await Promise.all(G.hero.tiles.map((t) => product(t.id, t)));
  await both("hero-sorted", { mode: "hero", ...G.hero, tiles });
}
if (want("versus")) {
  const cage = await product("jersey-tiffany");
  for (const v of G.versus) await both(`versus-${v.id}`, { mode: "versus", left: v.left, cage });
}
if (want("list")) {
  const cuts = [await product("jersey-tiffany"), await product("hoodie-diamond")];
  for (const v of G.list) await both(`list-${v.id}`, { mode: "list", struck: v.struck, cuts });
}
if (want("persona")) {
  const picks = await Promise.all(["jersey-tiffany", "hoodie-diamond", "shorts-legacy"].map((id) => product(id)));
  for (const v of G.personas) {
    const photo = await product(v.photo, { focus: v.focus, zoom: v.zoom });
    for (const [r, { h, safe }] of Object.entries(RATIOS)) {
      await shot({ mode: "persona", ...v, photo, picks, safe, tagY: r === "9x16" ? 420 : 330 }, h, path.join(OUT, `persona-${v.id}-${r}.png`));
    }
  }
}
if (want("budget")) {
  const sq = { top: 0, bottom: 0 };
  const cuts = ["jersey-tiffany", "hoodie-diamond", "shorts-legacy"].map((id) => url(CUT[id]));
  await shot({ mode: "budget-intro", ...G.budget.intro, cuts, safe: sq }, 1080, path.join(OUT, `budget-1-intro-1x1.png`));
  let n = 2;
  for (const c of G.budget.cards) {
    const card = await product(c.id, c);
    await shot({ mode: "budget", card, safe: sq }, 1080, path.join(OUT, `budget-${n++}-${c.id}-1x1.png`));
  }
  await shot({ mode: "budget-gift", ...G.budget.giftcard, giftcard: url("assets/img/giftcard.png"), safe: sq }, 1080, path.join(OUT, `budget-${n}-giftcard-1x1.png`));
}

await browser.close();
