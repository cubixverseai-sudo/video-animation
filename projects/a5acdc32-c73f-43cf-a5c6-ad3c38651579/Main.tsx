import React from 'react';
import { Series, Audio, staticFile, Sequence, useVideoConfig } from 'remotion';
import { IdeationScene } from './scenes/IdeationScene';
import { ProcessScene } from './scenes/ProcessScene';
import { LogoRevealScene } from './scenes/LogoRevealScene';

export const Main: React.FC = () => {
 return (
 <>
 <Series>
 <Series.Sequence durationInFrames={100}>
 <IdeationScene />
 </Series.Sequence>
 <Series.Sequence durationInFrames={100}>
 <ProcessScene />
 </Series.Sequence>
 <Series.Sequence durationInFrames={100}>
 <LogoRevealScene />
 </Series.Sequence>
 </Series>

 {/* Background Music */}
 <Audio
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/audio/bgm-bgm-bgm_tech_1770377681177.mp3')}
 volume={0.5}
 />

 {/* SFX: Glitch at start */}
 <Sequence from={10}>
 <Audio
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/audio/sfx-glitch-sfx_tech_1770377669852.mp3')}
 volume={0.7}
 />
 </Sequence>

 {/* SFX: Whoosh transition to Scene 2 */}
 <Sequence from={90}>
 <Audio
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/audio/sfx-whoosh-sfx_tech_1770377672220.mp3')}
 volume={0.7}
 />
 </Sequence>

 {/* SFX: Click in Scene 2 */}
 <Sequence from={150}>
 <Audio
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/audio/sfx-click-sfx_tech_1770377674498.mp3')}
 volume={0.7}
 />
 </Sequence>

 {/* SFX: Rise buildup to Logo */}
 <Sequence from={180}>
 <Audio
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/audio/sfx-rise-sfx_epic_1770377676689.mp3')}
 volume={0.6}
 />
 </Sequence>

 {/* SFX: Impact on Logo Reveal */}
 <Sequence from={205}>
 <Audio
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/audio/sfx-impact-sfx_epic_1770377678957.mp3')}
 volume={0.8}
 />
 </Sequence>
 </>
 );
};
