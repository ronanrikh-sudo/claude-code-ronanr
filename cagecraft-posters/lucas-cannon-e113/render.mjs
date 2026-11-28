// Renders the Lucas Cannon Fight Day posters to out/ at exact Instagram sizes.
//   NODE_PATH=$(npm root -g) node render.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(dir, "poster.html")).href;
const sizes = { story: [1080, 1920], post: [1080, 1350] };

const browser = await chromium.launch();
for (const [format, [width, height]] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(`${url}?format=${format}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  const file = path.join(dir, "out", `lucas-cannon-e113-fightday-${format}-${width}x${height}.png`);
  await page.locator("#poster").screenshot({ path: file });
  console.log(file);
  await page.close();
}
await browser.close();
