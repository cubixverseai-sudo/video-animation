import React from 'react';
import { Series, Audio, staticFile, AbsoluteFill } from 'remotion';
import { IntroScene } from './scenes/IntroScene';
import { LogoRevealScene } from './scenes/LogoRevealScene';

export const Main: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={70}>
          <IntroScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={80}>
          <LogoRevealScene />
        </Series.Sequence>
      </Series>
      
      <Audio src={staticFile('assets/2d94885d-ec1e-46b0-ba7c-b49f0d868089/audio/bgm-transition-bgm_tech_1770374921929.mp3')} volume={0.5} />
      
      <Series>
        <Series.Sequence durationInFrames={10}>
             <div /> 
        </Series.Sequence>
        <Series.Sequence durationInFrames={40}>
           <Audio src={staticFile('assets/2d94885d-ec1e-46b0-ba7c-b49f0d868089/audio/sfx-whoosh-sfx_tech_1770374937839.mp3')} volume={0.7} />
        </Series.Sequence>
      </Series>
      
      <Series>
         <Series.Sequence durationInFrames={70}>
            <div />
         </Series.Sequence>
         <Series.Sequence durationInFrames={60}>
            <Audio src={staticFile('assets/2d94885d-ec1e-46b0-ba7c-b49f0d868089/audio/sfx-reveal-sfx_tech_1770374940226.mp3')} volume={0.7} />
         </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
