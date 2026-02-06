import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { ParticleSystem } from '../components/ParticleSystem';
import { GlowText } from '../components/GlowText';

export const IntroScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const entrance = spring({
 frame,
 fps,
 config: { damping: 12, stiffness: 100 }
 });

 const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
 const scale = interpolate(frame, [0, 90], [1, 1.1]);

 const subTextY = interpolate(entrance, [0, 1], [50, 0]);
 const mainTextY = interpolate(entrance, [0, 1], [100, 0]);

 return (
 <AbsoluteFill>
 <GradientBackground />
 <ParticleSystem />
 
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `scale(${scale})` }}>
 
 {/* Subtitle */}
 <div style={{ transform: `translateY(${subTextY}px)`, 
 opacity,
 marginBottom: 20
 }}>
 <h2 style={{ fontFamily: 'Inter, sans-serif', 
 color: '#aaa', 
 fontSize: 32,
 letterSpacing: 4,
 margin: 0,
 textTransform: 'uppercase'
 }}>
 The World of
 </h2>
 </div>

 {/* Main Title */}
 <div style={{ transform: `translateY(${mainTextY}px)`, 
 opacity 
 }}>
 <GlowText 
 text="UNLIMITED" 
 fontSize={120} 
 glowColor="rgba(64, 224, 208, 0.5)" // Turquoise hint
 />
 <GlowText 
 text="ENTERTAINMENT" 
 fontSize={80} 
 style={{ marginTop: -20 }}
 />
 </div>

 </AbsoluteFill>
 </AbsoluteFill>
 );
};
