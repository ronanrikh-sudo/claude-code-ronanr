import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SHOW_CAPTIONS } from "./config";
import { SCENES, sec } from "./timing";
import { Backdrop, Grain } from "./components/Backdrop";
import { Captions } from "./components/Captions";
import { Problem } from "./scenes/Problem";
import { Prompt } from "./scenes/Prompt";
import { Work } from "./scenes/Work";
import { Output } from "./scenes/Output";
import { Close } from "./scenes/Close";

const scene = (s: { from: number; to: number }) => ({ from: sec(s.from), durationInFrames: sec(s.to) - sec(s.from) });

export const RfqPitch: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Sequence {...scene(SCENES.problem)} name="1 Problem"><Problem /></Sequence>
    <Sequence {...scene(SCENES.prompt)} name="2 One prompt"><Prompt /></Sequence>
    <Sequence {...scene(SCENES.work)} name="3 The work"><Work /></Sequence>
    <Sequence {...scene(SCENES.output)} name="4 Output"><Output /></Sequence>
    <Sequence {...scene(SCENES.close)} name="5 Close"><Close /></Sequence>
    <Grain />
    {SHOW_CAPTIONS && <Captions />}
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
