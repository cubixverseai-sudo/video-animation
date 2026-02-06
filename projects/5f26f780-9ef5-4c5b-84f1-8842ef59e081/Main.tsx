import React from 'react';
import { Series, Audio, staticFile, useCurrentFrame, interpolate, AbsoluteFill, Sequence } from 'remotion';
import { IntroSuspense } from './scenes/IntroSuspense';
import { LogoReveal } from './scenes/LogoReveal';
import { OutroHold } from './scenes/OutroHold';

export const Main: React.FC = () => {
 const frame = useCurrentFrame();

 const bgmVolume = (f: number) => interpolate(f, [0, 60, 270, 300], [0, 0.5, 0.5, 0], { extrapolateRight: 'clamp' });

 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 
 <Series>
 <Series.Sequence durationInFrames={90}>
 <IntroSuspense />
 </Series.Sequence>
 <Series.Sequence durationInFrames={120}>
 <LogoReveal />
 </Series.Sequence>
 <Series.Sequence durationInFrames={90}>
 <OutroHold />
 </Series.Sequence>
 </Series>

 <Audio 
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/audio/bgm-cinematic-bgm_cinematic_1770384590136.mp3')}
 volume={bgmVolume}
 />

 <Sequence from={60}>
 <Audio 
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/audio/sfx-rise-sfx_dark_1770384587779.mp3')}
 volume={0.6}
 />
 </Sequence>

 <Sequence from={90}>
 <Audio 
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/audio/sfx-impact-sfx_epic_1770384582386.mp3')}
 volume={0.8}
 />
 </Sequence>

 <Sequence from={95}>
 <Audio 
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/audio/sfx-whoosh-sfx_tech_1770384585185.mp3')}
 volume={0.5}
 />
 </Sequence>

 </AbsoluteFill>
 );
};
