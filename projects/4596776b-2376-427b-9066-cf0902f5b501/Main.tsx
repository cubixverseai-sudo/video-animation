import React from 'react';
import { Series, Audio, staticFile, AbsoluteFill } from 'remotion';
import { IntroScene } from './scenes/IntroScene';
import { FeatureScene } from './scenes/FeatureScene';
import { LogoScene } from './scenes/LogoScene';
import { HassanScene } from './scenes/HassanScene';

export const Main: React.FC = () => {
 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 <Series>
 {/* Scene 1: Intro (Shortened to 2s) */}
 <Series.Sequence durationInFrames={60}>
 <IntroScene />
 </Series.Sequence>

 {/* Scene 2: Hassan (New 3s clip) */}
 <Series.Sequence durationInFrames={90}>
 <HassanScene />
 </Series.Sequence>

 {/* Scene 3: Features (Shortened to 2s) */}
 <Series.Sequence durationInFrames={60}>
 <FeatureScene />
 </Series.Sequence>

 {/* Scene 4: Logo (3s) */}
 <Series.Sequence durationInFrames={90}>
 <LogoScene />
 </Series.Sequence>
 </Series>

 {/* Audio Layer - BGM */}
 <Audio 
 src={staticFile('assets/4596776b-2376-427b-9066-cf0902f5b501/audio/bgm-cinematic-bgm_epic_1770386125532.mp3')} 
 volume={0.5} 
 />
 
 {/* SFX Layer */}
 {/* Intro Whoosh */}
 <Series>
 <Series.Sequence durationInFrames={10}>
 <div /> 
 </Series.Sequence>
 <Series.Sequence durationInFrames={50}>
 <Audio src={staticFile('assets/4596776b-2376-427b-9066-cf0902f5b501/audio/sfx-whoosh-sfx_tech_1770386136119.mp3')} volume={0.6} />
 </Series.Sequence>
 </Series>

 {/* Hassan Transition (Reuse Transition SFX) */}
 <Series>
 <Series.Sequence durationInFrames={50}>
 <div />
 </Series.Sequence>
 <Series.Sequence durationInFrames={40}>
 <Audio src={staticFile('assets/4596776b-2376-427b-9066-cf0902f5b501/audio/sfx-transition-sfx_tech_1770386138510.mp3')} volume={0.6} />
 </Series.Sequence>
 </Series>

 {/* Feature Transition */}
 <Series>
 <Series.Sequence durationInFrames={140}>
 <div />
 </Series.Sequence>
 <Series.Sequence durationInFrames={40}>
 <Audio src={staticFile('assets/4596776b-2376-427b-9066-cf0902f5b501/audio/sfx-whoosh-sfx_tech_1770386136119.mp3')} volume={0.6} />
 </Series.Sequence>
 </Series>

 {/* Logo Impact */}
 <Series>
 <Series.Sequence durationInFrames={210}>
 <div />
 </Series.Sequence>
 <Series.Sequence durationInFrames={50}>
 <Audio src={staticFile('assets/4596776b-2376-427b-9066-cf0902f5b501/audio/sfx-impact-sfx_epic_1770386140762.mp3')} volume={0.8} />
 </Series.Sequence>
 </Series>

 </AbsoluteFill>
 );
};
