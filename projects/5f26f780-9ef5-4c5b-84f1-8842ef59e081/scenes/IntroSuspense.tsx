import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { GodRays } from '../components/GodRays';

export const IntroSuspense: React.FC = () => {
 const frame = useCurrentFrame();
 
 const opacity = interpolate(frame, [0, 60], [0, 1]);
 const scale = interpolate(frame, [0, 90], [0.8, 1]);
 // Increased brightness slightly since white logo on black needs to be visible
 const brightness = interpolate(frame, [0, 90], [0, 1]); 

 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 <GodRays color="#E50914" />
 
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 <Img
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/images/storia-logo-white.png')}
 style={{ width: 600,
 opacity,
 transform: `scale(${scale})`,
 filter: `brightness(${brightness}) drop-shadow(0 0 10px rgba(255,255,255,0.2))`,
 objectFit: 'contain',
 }}
 />
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
