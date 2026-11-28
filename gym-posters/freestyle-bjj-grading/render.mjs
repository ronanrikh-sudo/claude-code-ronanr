// Renders the BJJ Grading Day post to out/ at 1080x1350.
//   NODE_PATH=$(npm root -g) node render.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(dir, "poster.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");
const file = path.join(dir, "out", "freestyle-bjj-grading-post-1080x1350.png");
await page.locator("#poster").screenshot({ path: file });
console.log(file);
await browser.close();
