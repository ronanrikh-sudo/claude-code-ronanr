import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import "./fonts";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./config";
import { THEME } from "./theme";
import { Ad, HOOKS, Hook } from "./Ad";

// Hold the first frame until every family is loaded, so nothing renders in a fallback face.
if (typeof document !== "undefined") {
  const handle = delayRender("fonts");
  Promise.all([
    document.fonts.load(`italic 900 40px '${THEME.families.display}'`),
    ...["500", "600", "700"].map((w) => document.fonts.load(`${w} 40px '${THEME.families.body}'`)),
  ]).then(() => continueRender(handle));
}

const ids: Record<Hook, string> = { restock: "Restock", colourway: "Colourway", kitbag: "KitBag" };

export const Root: React.FC = () => (
  <>
    {HOOKS.map((hook) => (
      <Composition key={hook} id={ids[hook]} component={Ad} defaultProps={{ hook, safe: false }}
        durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
  </>
);
