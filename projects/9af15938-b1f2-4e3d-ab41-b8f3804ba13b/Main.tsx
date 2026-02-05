import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import { GlitchScene } from './scenes/GlitchScene';
import { ExplosionScene } from './scenes/ExplosionScene';
import { RevealScene } from './scenes/RevealScene';

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Sequence from={0} durationInFrames={30}>
        <GlitchScene />
      </Sequence>

      <Sequence from={30} durationInFrames={60}>
        <ExplosionScene />
      </Sequence>

      <Sequence from={90} durationInFrames={30}>
        <RevealScene />
      </Sequence>

      <Sequence from={28}>
        <Audio src={staticFile('assets/9af15938-b1f2-4e3d-ab41-b8f3804ba13b/audio/sfx-dark-sfx_dark_1770285282537.mp3')} />
      </Sequence>

      <Sequence from={35}>
        <Audio src={staticFile('assets/9af15938-b1f2-4e3d-ab41-b8f3804ba13b/audio/sfx-whoosh-sfx_tech_1770285286157.mp3')} />
      </Sequence>
    </AbsoluteFill>
  );
};
