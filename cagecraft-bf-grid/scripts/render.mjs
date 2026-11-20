// Renders every asset in config.json with Playwright + ffmpeg.
//
// Interactive ads (tap a product -> its page):
//   out/cards/1x1/<product>.png     1080x1080 card per product: manual carousel ad cards
//   out/cards/4x5/<product>.png     1080x1350 card per product
//   out/template/frame-<ratio>.png  transparent overlay for a Meta Commerce Manager image template
//   out/template/guide-<ratio>.png  the same frame with the dynamic layers marked
//   out/template/layers.json        pixel boxes for the template's catalog-field layers
// Organic / non-interactive:
//   out/story-<id>.png / .mp4       1080x1920 story grid (static first frame + scrolling video)
//   out/feed-<n>.png                1080x1350 4:5 post, 2x2 grid
//
// Usage: node scripts/render.mjs [--only story|feed|cards|template] [--no-video]
import { readFile, writeFile, mkdir, access, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// CJS resolution so a local install (`npm i -D playwright`) or a global one on NODE_PATH both work.
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "out");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const noVideo = args.includes("--no-video");
const want = (k) => !only || only === k;

const config = JSON.parse(await readFile(path.join(ROOT, "config.json"), "utf8"));
const { products } = JSON.parse(await readFile(path.join(ROOT, "products.json"), "utf8"));
const offer = config.offer;

const exists = (f) => access(f).then(() => true, () => false);
const fileUrl = (p) => pathToFileURL(p).href;
const logo = fileUrl(path.join(ROOT, "assets/logo-white.png"));
const rel = (f) => path.relative(ROOT, f);

async function product(id) {
  const p = products[id];
  if (!p) throw new Error(`Unknown product id "${id}" in config.json`);
  let src = null;
  for (const ext of ["jpg", "png"]) {
    const f = path.join(ROOT, "assets/img", `${id}.${ext}`);
    if (await exists(f)) { src = fileUrl(f); break; }
  }
  if (!src) throw new Error(`No image for "${id}". Run: npm run images`);
  // `sale` is the live sale price from Shopify; without it, apply the config percentage
  // in integer cents so 79.95 * 60% = 47.97 exactly.
  const now = p.sale ?? Math.round(p.price * (100 - offer.percentOff)) / 100;
  const pct = Math.round(((p.price - now) / p.price) * 100);
  return { ...p, id, src, now, pct };
}

function run(cmd, argv) {
  return new Promise((resolve, reject) => {
    const ps = spawn(cmd, argv, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    ps.stderr.on("data", (d) => (err += d));
    ps.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}\n${err.slice(-2000)}`))));
  });
}

const browser = await chromium.launch();
const pageUrl = fileUrl(path.join(ROOT, "src/page.html"));

async function open(data, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await ctx.addInitScript((d) => { window.__DATA__ = d; }, data);
  const page = await ctx.newPage();
  await page.goto(pageUrl);
  const info = await page.evaluate(() => window.__ready);
  return { ctx, page, info };
}
async function shot(data, width, height, file, opts = {}) {
  const { ctx, page, info } = await open(data, width, height);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height }, ...opts });
  await ctx.close();
  console.log(`${rel(file)}`);
  return info;
}

const base = { offer, cta: config.cta, logo };
const defaultBg = config.stories[0].bg;
const RATIOS = { "1x1": 1080, "4x5": 1350, "9x16": 1920 };
// Instagram Stories UI covers ~14% top and ~18% bottom; keep the badge and nameplate out of it.
const STORY_SAFE = { top: 250, bottom: 340 };

// ---------- interactive: carousel cards ----------
if (want("cards")) {
  for (const ratio of ["1x1", "4x5"]) {
    await mkdir(path.join(OUT, "cards", ratio), { recursive: true });
    for (const id of Object.keys(products)) {
      await shot({ ...base, mode: "single", height: RATIOS[ratio], bg: defaultBg, cards: [await product(id)] },
        1080, RATIOS[ratio], path.join(OUT, "cards", ratio, `${id}.png`));
    }
  }
}

// ---------- interactive: Meta image-template frames ----------
if (want("template")) {
  await mkdir(path.join(OUT, "template"), { recursive: true });
  const layers = {
    _note: "Pixel boxes (on a 1080-wide canvas) for the catalog-field layers of the Meta Commerce Manager image template. Upload frame-<ratio>.png as an image layer above the product layer, then add these catalog fields on top.",
    offer: { percentOff: offer.percentOff },
  };
  for (const [ratio, h] of Object.entries(RATIOS)) {
    const safe = ratio === "9x16" ? STORY_SAFE : null;
    const data = { ...base, mode: "frame", height: h, safe, bg: defaultBg, cards: [] };
    const info = await shot(data, 1080, h, path.join(OUT, "template", `frame-${ratio}.png`), { omitBackground: true });
    await shot({ ...data, mode: "guide" }, 1080, h, path.join(OUT, "template", `guide-${ratio}.png`));
    layers[ratio] = { canvas: { w: 1080, h }, product_image: { x: 0, y: 0, w: 1080, h, note: "behind the frame; crop to fill" }, ...info.slots };
  }
  await writeFile(path.join(OUT, "template", "layers.json"), JSON.stringify(layers, null, 2) + "\n");
  console.log("out/template/layers.json");
}

// ---------- organic: stories ----------
if (want("story")) {
  for (const s of config.stories) {
    const data = {
      ...base, mode: "story", bg: s.bg,
      hero: s.hero ? await product(s.hero) : null,
      cards: await Promise.all(s.grid.map(product)),
    };
    const { ctx, page, info } = await open(data, 1080, 1920);
    const png = path.join(OUT, `story-${s.id}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    console.log(rel(png));

    if (!noVideo) {
      const tall = path.join(OUT, `.story-${s.id}-tall.png`);
      await page.screenshot({ path: tall, fullPage: true });
      const H = Math.round(info.height);
      const yEnd = Math.min(H - 1920, Math.max(0, info.ctaTop - 150)); // end card in the safe area
      const pxPerSec = 300;           // slow enough to read every price
      const hold0 = 1.2, hold1 = 2.6; // hold on the first frame and on the end card
      const dur = +(yEnd / pxPerSec).toFixed(2);
      const total = +(hold0 + dur + hold1).toFixed(2);
      const p = `clip((t-${hold0})/${dur},0,1)`;         // smoothstep ease-in-out
      const y = `${yEnd}*(${p})*(${p})*(3-2*(${p}))`;
      const mp4 = path.join(OUT, `story-${s.id}.mp4`);
      await run("ffmpeg", [
        "-y", "-loop", "1", "-framerate", "30", "-i", tall,
        "-vf", `crop=1080:1920:0:'${y}',format=yuv420p`,
        "-t", String(total), "-r", "30",
        "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high",
        "-movflags", "+faststart", mp4,
      ]);
      await rm(tall);
      console.log(`${rel(mp4)}  (${total}s)`);
    }
    await ctx.close();
  }
}

// ---------- organic: 4:5 feed posts, 4 cards each ----------
if (want("feed")) {
  const ids = config.feedCards;
  for (let i = 0; i * 4 < ids.length; i++) {
    const cards = await Promise.all(ids.slice(i * 4, i * 4 + 4).map(product));
    const bg = config.stories[i % config.stories.length].bg;
    await shot({ ...base, mode: "feed", bg, cards }, 1080, 1350, path.join(OUT, `feed-${i + 1}.png`));
  }
}

await browser.close();
