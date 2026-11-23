import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { cue, LEAD, sec, T } from "./timing";
import { Backdrop } from "./components/Backdrop";
import { FX } from "./components/FX";
import { BoltWipe } from "./components/BoltWipe";
import { Hook } from "./scenes/Hook";
import { Demo } from "./scenes/Demo";
import { Ladder } from "./scenes/Ladder";
import { Finale } from "./scenes/Finale";

export type SceneProps = { from: number; to: number };

// Scene plan: each starts on its voice-over cue (minus LEAD) and runs to the next.
//   S1 hook (kinetic type) -> bolt wipe on "Now" -> S2-S5 one continuous phone demo -> S6 tier ladder -> bolt wipe -> S7 finale
const PLAN: { cue: string; Scene: React.FC<SceneProps> }[] = [
  { cue: "S1", Scene: Hook },
  { cue: "S2", Scene: Demo },
  { cue: "S6", Scene: Ladder },
  { cue: "S7", Scene: Finale },
];

export const SCENES = PLAN.map((p, i) => ({
  ...p,
  from: i === 0 ? 0 : cue(p.cue) - LEAD,
  to: i === PLAN.length - 1 ? T.totalSeconds : cue(PLAN[i + 1].cue) - LEAD,
}));

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#050506" }}>
    <Backdrop />
    {SCENES.map(({ Scene, from, to, cue: c }) => (
      <Sequence key={c} from={sec(from)} durationInFrames={sec(to) - sec(from)} name={c}>
        <Scene from={from} to={to} />
      </Sequence>
    ))}
    <BoltWipe at={cue("S2") - LEAD} />
    <BoltWipe at={cue("S7") - LEAD} />
    <FX />
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
