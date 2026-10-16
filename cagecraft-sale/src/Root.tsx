import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import "./fonts";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./config";
import { THEME } from "./theme";
import { Main } from "./Video";

// Hold the first frame until every theme family is loaded, so nothing renders in a fallback face.
if (typeof document !== "undefined") {
  const handle = delayRender("fonts");
  Promise.all([
    document.fonts.load(`italic 900 40px '${THEME.families.display}'`),
    document.fonts.load(`900 40px '${THEME.families.display}'`),
    ...["500", "600", "700"].map((w) => document.fonts.load(`${w} 40px '${THEME.families.body}'`)),
  ]).then(() => continueRender(handle));
}

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
