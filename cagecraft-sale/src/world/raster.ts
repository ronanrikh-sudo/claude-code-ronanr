// Turn type and the logo into voxel grids, in the browser, from the real loaded font and the
// real logo file, so the cube formations match the captions and the brand mark exactly.
import { staticFile } from "remotion";
import { FONTS, THEME } from "../theme";

export type Grid = { cols: number; rows: number; on: (c: number, r: number) => boolean };

const sample = (ctx: CanvasRenderingContext2D, w: number, h: number, cols: number, rows: number, thresh = 0.45): Grid => {
  const data = ctx.getImageData(0, 0, w, h).data;
  const cw = w / cols, ch = h / rows;
  const cells: boolean[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let sum = 0, n = 0;
    for (let y = Math.floor(r * ch); y < Math.floor((r + 1) * ch); y++)
      for (let x = Math.floor(c * cw); x < Math.floor((c + 1) * cw); x++) { sum += data[(y * w + x) * 4 + 3]; n++; }
    cells.push(sum / Math.max(1, n) / 255 > thresh);
  }
  return { cols, rows, on: (c, r) => cells[r * cols + c] };
};

/** Rasterise a word in the display face (extended heavy italic) to a grid `rows` tall. */
export const rasterText = async (text: string, rows: number): Promise<Grid> => {
  const font = `italic 900 125% 200px ${FONTS.display}`;
  await document.fonts.load(`italic 900 200px '${THEME.families.display}'`);
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  // font-stretch is not part of the canvas font shorthand everywhere: set it explicitly
  ctx.font = font.replace(" 125%", "");
  (ctx as unknown as { fontStretch: string }).fontStretch = "expanded";
  const m = ctx.measureText(text);
  const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + 8, h = Math.ceil(asc + desc) + 8;
  c.width = w; c.height = h;
  ctx.font = font.replace(" 125%", "");
  (ctx as unknown as { fontStretch: string }).fontStretch = "expanded";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, m.actualBoundingBoxLeft + 4, asc + 4);
  const cols = Math.round((w / h) * rows);
  return sample(ctx, w, h, cols, rows);
};

/** Rasterise the CAGECRAFT wordmark (white-on-transparent PNG) to a grid `rows` tall. */
export const rasterLogo = (rows: number): Promise<Grid> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      // drop the (R) mark: it is far too small to survive as cubes; the crisp logo carries it
      const cut = Math.round(img.width * 0.965);
      ctx.clearRect(cut, 0, img.width - cut, img.height);
      const cols = Math.round((cut / img.height) * rows * 1.0);
      const g = sample(ctx, cut, img.height, cols, rows, 0.4);
      resolve(g);
    };
    img.onerror = reject;
    img.src = staticFile("img/logo-white.png");
  });
