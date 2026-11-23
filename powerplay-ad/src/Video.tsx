import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { cue, LEAD, sec, T } from "./timing";
import { Backdrop } from "./components/Backdrop";
import { FX } from "./components/FX";
import { BoltWipe } from "./components/BoltWipe";
import { AdDemo } from "./scenes/AdDemo";
import { Offer } from "./scenes/Offer";
import { CTA } from "./scenes/CTA";
import { Earned } from "./scenes/Earned";
import { tReveal } from "./scenes/AdDemo";

export type SceneProps = { from: number; to: number };

// Meta ad: 0-3 s hook + demo as one continuous phone move -> dive into the free tee -> "earned it" reveal ->
// bolt wipe -> offer -> bolt wipe -> CTA end card. AdDemo and Earned overlap briefly for the dive.
export const SCENES = (() => {
  const offer = cue("S4") - LEAD, cta = cue("S5") - LEAD;
  return [
    { cue: "S1", Scene: AdDemo, from: 0, to: tReveal() + 0.25 },
    { cue: "S3", Scene: Earned, from: tReveal() - 0.05, to: offer },
    { cue: "S4", Scene: Offer, from: offer, to: cta },
    { cue: "S5", Scene: CTA, from: cta, to: T.totalSeconds },
  ] as { cue: string; Scene: React.FC<SceneProps>; from: number; to: number }[];
})();

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#050506" }}>
    <Backdrop />
    {SCENES.map(({ Scene, from, to, cue: c }) => (
      <Sequence key={c} from={sec(from)} durationInFrames={sec(to) - sec(from)} name={c}>
        <Scene from={from} to={to} />
      </Sequence>
    ))}
    <BoltWipe at={cue("S4") - LEAD} />
    <BoltWipe at={cue("S5") - LEAD} />
    <FX />
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
