import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SHOW_CAPTIONS } from "./config";
import { cue, LEAD, sec, T } from "./timing";
import { Backdrop, Grain } from "./components/Backdrop";
import { Captions } from "./components/Captions";
import { Hook } from "./scenes/Hook";
import { Terminal } from "./scenes/Terminal";
import { Checklist } from "./scenes/Checklist";
import { KineticLine } from "./scenes/KineticLine";
import { Finale } from "./scenes/Finale";

export type SceneProps = { from: number; to: number };

// ----------------------------------------------------------------- scene plan
// Choose and order scenes for THIS project's story (see references/scene-recipes.md);
// these five are only starting points. Each scene starts on a VO cue: "S2" = segment
// start, "S3.1" = clause 1 of S3. Scenes run until the next cue. captions:false hides captions where the scene's
// own kinetic type already says the line.
const PLAN: { cue: string; Scene: React.FC<SceneProps>; captions?: boolean; finale?: boolean }[] = [
  { cue: "S1", Scene: Hook },
  { cue: "S2", Scene: Terminal },
  { cue: "S3", Scene: Checklist },
  { cue: "S4", Scene: KineticLine, captions: false },
  { cue: "S5", Scene: Finale, captions: false, finale: true },
];

export const SCENES = PLAN.map((p, i) => ({
  ...p,
  from: i === 0 ? 0 : cue(p.cue) - LEAD,
  to: i === PLAN.length - 1 ? T.totalSeconds : cue(PLAN[i + 1].cue) - LEAD,
}));

const finaleFrom = SCENES.find((s) => s.finale)?.from ?? null;

export const Main: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    {SCENES.map(({ Scene, from, to, cue: c }) => (
      <Sequence key={c} from={sec(from)} durationInFrames={sec(to) - sec(from)} name={c}>
        <Scene from={from} to={to} />
      </Sequence>
    ))}
    <Grain finaleFrom={finaleFrom} />
    {SHOW_CAPTIONS && <Captions hidden={SCENES.filter((s) => s.captions === false).map((s) => [s.from, s.to])} />}
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
