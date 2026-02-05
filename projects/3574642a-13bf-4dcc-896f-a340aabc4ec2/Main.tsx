import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import { IntroScene } from './scenes/IntroScene';

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Scene */}
      <Sequence from={0} durationInFrames={180}>
        <IntroScene />
      </Sequence>
      
      {/* Audio */}
      <Audio 
        src={staticFile('assets/3574642a-13bf-4dcc-896f-a340aabc4ec2/audio/bgm-epic-bgm_epic_1770285741309.mp3')} 
        volume={0.6} 
      />
      <Audio 
        src={staticFile('assets/3574642a-13bf-4dcc-896f-a340aabc4ec2/audio/sfx-transition-sfx_dramatic_1770285752680.mp3')} 
        startFrom={0} // SFX is short, play it from the beginning at its designated time
        volume={0.8}
      />
      <Audio 
        src={staticFile('assets/3574642a-13bf-4dcc-896f-a340aabc4ec2/audio/sfx-impact-sfx_heavy_1770285756101.mp3')} 
        startFrom={0}
        volume={1.0}
      />
    </AbsoluteFill>
  );
};
