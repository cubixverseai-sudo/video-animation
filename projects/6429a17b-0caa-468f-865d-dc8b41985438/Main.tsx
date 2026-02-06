import React from 'react';
import { Series, Audio, staticFile, AbsoluteFill } from 'remotion';
import { IntroReveal } from './scenes/IntroReveal';
import { ContentPulse } from './scenes/ContentPulse';
import { OutroLogo } from './scenes/OutroLogo';

export const Main: React.FC = () => {
 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 <Series>
 <Series.Sequence durationInFrames={60}>
 <IntroReveal />
 </Series.Sequence>
 <Series.Sequence durationInFrames={60}>
 <ContentPulse />
 </Series.Sequence>
 <Series.Sequence durationInFrames={30}>
 <OutroLogo />
 </Series.Sequence>
 </Series>

 <Audio
 src={staticFile('assets/6429a17b-0caa-468f-865d-dc8b41985438/audio/bgm-cinematic-bgm_cinematic_1770385636744.mp3')}
 volume={0.5}
 />
 
 {/* SFX: Intro Impact */}
 <Series>
 <Series.Sequence durationInFrames={60}>
 <Audio 
 src={staticFile('assets/6429a17b-0caa-468f-865d-dc8b41985438/audio/sfx-impact-sfx_dark_1770385618155.mp3')}
 volume={0.8}
 />
 </Series.Sequence>
 
 {/* SFX: Whoosh for transition */}
 <Series.Sequence durationInFrames={60}>
 <Audio 
 src={staticFile('assets/6429a17b-0caa-468f-865d-dc8b41985438/audio/sfx-whoosh-sfx_tech_1770385621131.mp3')}
 volume={0.6}
 />
 </Series.Sequence>

 {/* SFX: Outro fade */}
 <Series.Sequence durationInFrames={30}>
 <Audio 
 src={staticFile('assets/6429a17b-0caa-468f-865d-dc8b41985438/audio/sfx-transition-sfx_cinematic_1770385634561.mp3')}
 volume={0.7}
 />
 </Series.Sequence>
 </Series>
 </AbsoluteFill>
 );
};
