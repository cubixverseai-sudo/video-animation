import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from 'remotion';
import { ScanLine } from '../components/ScanLine';

export const LogoReveal: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 // "Tudum" style entrance
 // Fast zoom out from extreme close up
 const scale = spring({
 frame,
 fps,
 config: { damping: 15, stiffness: 120, mass: 0.8 },
 from: 15,
 to: 1,
 });

 // Shake effect on impact
 const shake = spring({
 frame,
 fps,
 config: { damping: 5, stiffness: 300 },
 from: 20,
 to: 0,
 });
 
 // Random jitter for shake
 const x = Math.sin(frame * 25) * shake;
 const y = Math.cos(frame * 25) * shake;

 // Flash of light
 const flashOpacity = interpolate(frame, [0, 15], [1, 0], { extrapolateRight: 'clamp' });

 return (
 <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
 
 {/* Background Glow */}
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 <div style={{ width: 600,
 height: 600,
 borderRadius: '50%',
 background: 'radial-gradient(circle, #aa0610 0%, transparent 70%)',
 opacity: 0.4,
 transform: `scale(${interpolate(frame, [0, 100], [0.5, 1.2])})`
 }} />
 </AbsoluteFill>

 {/* Main Logo */}
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 <Img
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/images/netflixlogo.0.0.1466448626.webp')}
 style={{ width: 400,
 transform: `scale(${scale}) translate(${x}px, ${y}px)`,
 // Slight chromatic aberration simulation via shadow
 filter: `drop-shadow(${x}px 0px 0px rgba(0,255,255,0.5)) drop-shadow(${-x}px 0px 0px rgba(255,0,0,0.5))`
 }}
 />
 </AbsoluteFill>
 
 <Sequence from={0}>
 <ScanLine color="#ff9999" />
 </Sequence>

 {/* Impact Flash */}
 <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flashOpacity, mixBlendMode: 'overlay' }} />
 </AbsoluteFill>
 );
};
