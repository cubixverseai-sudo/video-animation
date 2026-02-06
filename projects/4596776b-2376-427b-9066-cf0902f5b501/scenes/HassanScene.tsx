import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { ParticleSystem } from '../components/ParticleSystem';
import { GlowText } from '../components/GlowText';

export const HassanScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const entrance = spring({
 frame,
 fps,
 config: { damping: 12, stiffness: 100 }
 });

 const scale = interpolate(entrance, [0, 1], [0.8, 1.1]);
 const opacity = interpolate(frame, [0, 20, 70, 90], [0, 1, 1, 0]);
 const spacing = interpolate(frame, [0, 90], [50, 20]);

 const containerStyle: React.CSSProperties = {
 opacity,
 transform: `scale(${scale})`,
 textAlign: 'center',
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center'
 };

 const subtitleStyle: React.CSSProperties = {
 fontFamily: 'Inter',
 color: '#aaa',
 fontSize: 24,
 letterSpacing: 8,
 marginBottom: 20
 };

 return (
 <AbsoluteFill>
 <GradientBackground />
 <ParticleSystem count={60} />
 
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 <div style={containerStyle}>
 <div style={subtitleStyle}>STARRING</div>
 <GlowText 
 text="HASSAN" 
 fontSize={140} 
 color="#fff"
 glowColor="rgba(255, 215, 0, 0.6)"
 style={{ letterSpacing: spacing }}
 />
 </div>
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
