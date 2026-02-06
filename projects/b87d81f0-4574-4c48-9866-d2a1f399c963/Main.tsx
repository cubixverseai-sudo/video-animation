import React from 'react';
import { Series, Audio, staticFile, AbsoluteFill } from 'remotion';
import { TitleScene } from './scenes/TitleScene';
import { DashboardScene } from './scenes/DashboardScene';
import { LogoScene } from './scenes/LogoScene';

export const Main: React.FC = () => {
 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 <Series>
 <Series.Sequence durationInFrames={90}>
 <TitleScene />
 </Series.Sequence>
 <Series.Sequence durationInFrames={120}>
 <DashboardScene />
 </Series.Sequence>
 <Series.Sequence durationInFrames={90}>
 <LogoScene />
 </Series.Sequence>
 </Series>

 {/* Audio Layer */}
 <Audio 
 src={staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/audio/bgm-tech-bgm_tech_1770377412641.mp3')} 
 volume={0.5} 
 />
 
 {/* SFX: Keyboard for typing */}
 <Series>
 <Series.Sequence durationInFrames={10}><div /></Series.Sequence>
 <Series.Sequence durationInFrames={80}>
 <Audio src={staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/audio/sfx-keyboard-sfx_tech_1770377402602.mp3')} volume={0.6} />
 </Series.Sequence>
 </Series>

 {/* SFX: Whoosh for transition 1 */}
 <Series>
 <Series.Sequence durationInFrames={85}><div /></Series.Sequence>
 <Series.Sequence durationInFrames={40}>
 <Audio src={staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/audio/sfx-whoosh-sfx_tech_1770377405464.mp3')} volume={0.6} />
 </Series.Sequence>
 </Series>

 {/* SFX: Glitch scan for dashboard */}
 <Series>
 <Series.Sequence durationInFrames={110}><div /></Series.Sequence>
 <Series.Sequence durationInFrames={60}>
 <Audio src={staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/audio/sfx-glitch-sfx_tech_1770377407654.mp3')} volume={0.4} />
 </Series.Sequence>
 </Series>

 {/* SFX: Reveal for logo */}
 <Series>
 <Series.Sequence durationInFrames={210}><div /></Series.Sequence>
 <Series.Sequence durationInFrames={90}>
 <Audio src={staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/audio/sfx-reveal-sfx_luxury_1770377409993.mp3')} volume={0.7} />
 </Series.Sequence>
 </Series>

 </AbsoluteFill>
 );
};
