// Renders the four posters to out/ at exact Instagram pixel sizes.
//   node render.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // resolves a global install via NODE_PATH too
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const page_url = pathToFileURL(path.join(dir, "poster.html")).href;
const sizes = { story: [1080, 1920], post: [1080, 1350] };

const browser = await chromium.launch();
for (const poster of ["fightweek", "winner"]) {
  for (const [format, [width, height]] of Object.entries(sizes)) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${page_url}?poster=${poster}&format=${format}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    const file = path.join(dir, "out", `zane-basi-vk8-${poster}-${format}-${width}x${height}.png`);
    await page.locator("#poster").screenshot({ path: file });
    console.log(file);
    await page.close();
  }
}
await browser.close();
