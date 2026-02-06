import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';

export const OutroHold: React.FC = () => {
 const frame = useCurrentFrame();
 
 // Subtle breathing scale
 const scale = 1 + Math.sin(frame / 40) * 0.02;
 
 // Fade out at end
 const opacity = interpolate(frame, [60, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

 return (
 <AbsoluteFill style={{ backgroundColor: '#000' }}>
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity }}>
 <Img
 src={staticFile('assets/5f26f780-9ef5-4c5b-84f1-8842ef59e081/images/netflixlogo.0.0.1466448626.webp')}
 style={{ width: 400,
 transform: `scale(${scale})`,
 filter: 'drop-shadow(0 0 20px rgba(229, 9, 20, 0.4))'
 }}
 />
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
