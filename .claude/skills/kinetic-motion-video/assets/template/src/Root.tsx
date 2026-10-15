import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./config";
import { Main } from "./Video";

// Hold the first frame until the webfonts are ready, so nothing renders in a fallback face.
if (typeof document !== "undefined") {
  const handle = delayRender("fonts");
  Promise.all([
    ...["400", "500", "600", "700", "800"].map((w) => document.fonts.load(`${w} 40px Inter`)),
    ...["400", "700"].map((w) => document.fonts.load(`${w} 40px "JetBrains Mono"`)),
  ]).then(() => continueRender(handle));
}

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
