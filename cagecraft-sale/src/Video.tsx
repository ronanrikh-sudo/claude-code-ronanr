import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./config";
import { THEME } from "./theme";
import { World } from "./world/World";
import { Captions } from "./overlay/Captions";
import { StageOverlay } from "./overlay/Stage";
import { FX, worldFilter } from "./overlay/FX";

// Layers: the 3D cube world, HTML that rides on its stage, one-word captions, finish.
export const Main: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      <AbsoluteFill style={{ filter: worldFilter(t) }}>
        <World />
      </AbsoluteFill>
      <StageOverlay />
      <Captions />
      <FX />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
