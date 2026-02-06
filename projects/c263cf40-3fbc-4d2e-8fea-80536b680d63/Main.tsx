import React from 'react';
import { Series, Audio, staticFile, AbsoluteFill, interpolate, useCurrentFrame, Sequence } from 'remotion';
import { IntroBuild } from './scenes/IntroBuild';
import { LogoReveal } from './scenes/LogoReveal';

export const Main: React.FC = () => {
 const frame = useCurrentFrame();
 const totalDuration = 300;

 const globalOpacity = interpolate(
 frame,
 [totalDuration - 20, totalDuration],
 [1, 0],
 { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
 );

 const bgmVolume = (f: number) => interpolate(f, [0, 60, 280, 300], [0, 0.5, 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 <div style={{ opacity: globalOpacity, flex: 1, display: 'flex', width: '100%', height: '100%' }}>
 <Series>
 <Series.Sequence durationInFrames={120}>
 <IntroBuild />
 </Series.Sequence>
 <Series.Sequence durationInFrames={180}>
 <LogoReveal />
 </Series.Sequence>
 </Series>
 </div>

 <Audio
 src={staticFile('assets/c263cf40-3fbc-4d2e-8fea-80536b680d63/audio/bgm-cinematic-bgm_cinematic_1770380856314.mp3')}
 volume={bgmVolume}
 />
 
 <Sequence from={10}>
 <Audio
 src={staticFile('assets/c263cf40-3fbc-4d2e-8fea-80536b680d63/audio/sfx-whoosh-sfx_dark_1770380850499.mp3')} 
 volume={0.6}
 />
 </Sequence>

 <Sequence from={115}>
 <Audio
 src={staticFile('assets/c263cf40-3fbc-4d2e-8fea-80536b680d63/audio/sfx-impact-sfx_cinematic_1770380844381.mp3')} 
 volume={0.8}
 />
 </Sequence>
 </AbsoluteFill>
 );
};
