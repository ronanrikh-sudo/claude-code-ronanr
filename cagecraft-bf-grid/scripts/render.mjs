// Renders every ad in config.json with Playwright + ffmpeg.
//   out/story-<id>.png        1080x1920 static story (first frame)
//   out/story-<id>.mp4        1080x1920 scrolling story video (top hold -> eased scroll -> end card)
//   out/feed-<n>.png          1080x1350 4:5 feed post, 2x2 grid
//   out/cards/<product>.png   1080x1080 single card per product (carousel / catalog)
// Usage: node scripts/render.mjs [--only story|feed|cards] [--no-video]
import { readFile, mkdir, access, rm } from "node:fs/promises";
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

const config = JSON.parse(await readFile(path.join(ROOT, "config.json"), "utf8"));
const { products } = JSON.parse(await readFile(path.join(ROOT, "products.json"), "utf8"));
const offer = config.offer;

const exists = (f) => access(f).then(() => true, () => false);
const fileUrl = (p) => pathToFileURL(p).href;
const logo = fileUrl(path.join(ROOT, "assets/logo-white.png"));

async function product(id) {
  const p = products[id];
  if (!p) throw new Error(`Unknown product id "${id}" in config.json`);
  let src = null;
  for (const ext of ["jpg", "png"]) {
    const f = path.join(ROOT, "assets/img", `${id}.${ext}`);
    if (await exists(f)) { src = fileUrl(f); break; }
  }
  if (!src) throw new Error(`No image for "${id}". Run: npm run images`);
  // integer cents so 79.95 * 60% = 47.97 exactly
  const now = Math.round(p.price * (100 - offer.percentOff)) / 100;
  return { ...p, id, src, now };
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

await mkdir(path.join(OUT, "cards"), { recursive: true });
const base = { offer, cta: config.cta, logo };

// ---------- stories ----------
if (!only || only === "story") {
  for (const s of config.stories) {
    const data = {
      ...base, mode: "story", bg: s.bg,
      hero: s.hero ? await product(s.hero) : null,
      cards: await Promise.all(s.grid.map(product)),
    };
    const { ctx, page, info } = await open(data, 1080, 1920);
    const png = path.join(OUT, `story-${s.id}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    console.log(`story  ${path.relative(ROOT, png)}`);

    if (!noVideo) {
      const tall = path.join(OUT, `.story-${s.id}-tall.png`);
      await page.screenshot({ path: tall, fullPage: true });
      // Scroll so the end card sits in the middle of the story-safe area.
      const H = Math.round(info.height);
      const yEnd = Math.min(H - 1920, Math.max(0, info.ctaTop - 150));
      const pxPerSec = 300;           // slow enough to read every price
      const hold0 = 1.2, hold1 = 2.6; // hold on the first frame and on the end card
      const dur = +(yEnd / pxPerSec).toFixed(2);
      const total = +(hold0 + dur + hold1).toFixed(2);
      // smoothstep ease-in-out between the two holds
      const p = `clip((t-${hold0})/${dur},0,1)`;
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
      console.log(`video  ${path.relative(ROOT, mp4)}  (${total}s)`);
    }
    await ctx.close();
  }
}

// ---------- 4:5 feed posts, 4 cards each ----------
if (!only || only === "feed") {
  const ids = config.feedCards;
  for (let i = 0; i * 4 < ids.length; i++) {
    const cards = await Promise.all(ids.slice(i * 4, i * 4 + 4).map(product));
    const bg = config.stories[i % config.stories.length].bg;
    const { ctx, page } = await open({ ...base, mode: "feed", bg, cards }, 1080, 1350);
    const png = path.join(OUT, `feed-${i + 1}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log(`feed   ${path.relative(ROOT, png)}`);
    await ctx.close();
  }
}

// ---------- single 1:1 cards ----------
if (!only || only === "cards") {
  for (const id of Object.keys(products)) {
    const { ctx, page } = await open({ ...base, mode: "single", bg: config.stories[0].bg, cards: [await product(id)] }, 1080, 1080);
    const png = path.join(OUT, "cards", `${id}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    console.log(`card   ${path.relative(ROOT, png)}`);
    await ctx.close();
  }
}

await browser.close();
