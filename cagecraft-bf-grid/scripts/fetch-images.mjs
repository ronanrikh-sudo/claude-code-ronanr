// Downloads each product photo listed in products.json from the Shopify CDN into assets/img/.
// Shopify resizes on the fly with ?width=, so 1600px covers the full-width hero card at 1080p.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CDN = "https://cdn.shopify.com/s/files/1/0643/7358/8030/files/";
const WIDTH = 1600;
const force = process.argv.includes("--force");

const { products } = JSON.parse(await readFile(path.join(ROOT, "products.json"), "utf8"));
await mkdir(path.join(ROOT, "assets/img"), { recursive: true });

const exists = (f) => access(f).then(() => true, () => false);

for (const [id, p] of Object.entries(products)) {
  const dir = path.join(ROOT, "assets/img");
  if (!force && ((await exists(`${dir}/${id}.jpg`)) || (await exists(`${dir}/${id}.png`)))) {
    console.log(`skip  ${id}`);
    continue;
  }
  const sep = p.image.includes("?") ? "&" : "?";
  // format=pjpg asks for a JPEG; Shopify still returns a PNG when the source has alpha.
  const url = `${CDN}${p.image}${sep}width=${WIDTH}&format=pjpg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = buf.subarray(0, 4).toString("hex") === "89504e47" ? "png" : "jpg";
  await writeFile(`${dir}/${id}.${ext}`, buf);
  console.log(`saved ${id}.${ext}`);
}
