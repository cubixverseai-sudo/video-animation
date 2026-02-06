import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Img, staticFile } from 'remotion';
import { GlowContainer } from '../components/GlowContainer';

export const LogoReveal: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 // Impact scale
 const scale = spring({
 frame,
 fps,
 config: { damping: 12, stiffness: 100, mass: 0.5 },
 from: 3,
 to: 1,
 });

 // Flash effect
 const flashOpacity = interpolate(frame, [0, 15], [1, 0], { extrapolateRight: 'clamp' });

 // Slow drift after impact
 const drift = interpolate(frame, [0, 180], [1, 1.05]);

 // Logo opacity fade in very quickly
 const logoOpacity = interpolate(frame, [0, 5], [0, 1]);

 return (
 <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
 
 {/* Main Logo */}
 <div style={{ opacity: logoOpacity, transform: `scale(${scale * drift})` }}>
 <GlowContainer scale={1} blur={30} opacity={0.8}>
 <Img
 src={staticFile('assets/c263cf40-3fbc-4d2e-8fea-80536b680d63/images/storia-logo-white.png')}
 style={{ width: 600, objectFit: 'contain' }}
 />
 </GlowContainer>
 </div>

 {/* Impact Flash Overlay */}
 <AbsoluteFill 
 style={{ backgroundColor: '#fff', 
 opacity: flashOpacity,
 mixBlendMode: 'overlay'
 }} 
 />
 </AbsoluteFill>
 );
};
