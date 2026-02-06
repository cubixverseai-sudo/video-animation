import React from 'react';
import { Series, Audio, staticFile, AbsoluteFill, Sequence } from 'remotion';
import { IntroParticles } from './scenes/IntroParticles';
import { RingReveal } from './scenes/RingReveal';
import { TextReveal } from './scenes/TextReveal';
import { LogoHold } from './scenes/LogoHold';

export const Main: React.FC = () => {
  return (
    <>
      <AbsoluteFill style={{ backgroundColor: '#12001A' }}>
        <Series>
          <Series.Sequence durationInFrames={75}>
            <IntroParticles />
          </Series.Sequence>
          <Series.Sequence durationInFrames={75}>
            <RingReveal />
          </Series.Sequence>
          <Series.Sequence durationInFrames={75}>
            <TextReveal />
          </Series.Sequence>
          <Series.Sequence durationInFrames={75}>
            <LogoHold />
          </Series.Sequence>
        </Series>
      </AbsoluteFill>
      <AbsoluteFill>
        <Audio src={staticFile('assets/3c1c7d35-bcf9-4dd4-8e72-90ba34f74161/audio/bgm-energetic-bgm_energetic_1770374017299.mp3')} volume={0.3} />
        <Sequence from={75}>
          <Audio src={staticFile('assets/3c1c7d35-bcf9-4dd4-8e72-90ba34f74161/audio/sfx-whoosh-sfx_tech_1770374043042.mp3')} volume={0.7} />
        </Sequence>
        <Sequence from={150}>
          <Audio src={staticFile('assets/3c1c7d35-bcf9-4dd4-8e72-90ba34f74161/audio/sfx-glitch-sfx_tech_1770374059608.mp3')} volume={0.6} />
        </Sequence>
        <Sequence from={225}>
          <Audio src={staticFile('assets/3c1c7d35-bcf9-4dd4-8e72-90ba34f74161/audio/sfx-impact-sfx_tech_1770374092093.mp3')} volume={0.8} />
        </Sequence>
      </AbsoluteFill>
    </>
  );
};
