import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { CinematicText } from '../components/CinematicText';

export const IntroReveal: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const scale = interpolate(frame, [0, 60], [1.1, 1], {
 extrapolateRight: 'clamp',
 });

 const bgOpacity = interpolate(frame, [0, 10], [0, 1]);

 return (
 <AbsoluteFill
 style={{ backgroundColor: '#000000',
 justifyContent: 'center',
 alignItems: 'center',
 opacity: bgOpacity,
 }}
 >
 <AbsoluteFill
 style={{ justifyContent: 'center',
 alignItems: 'center',
 transform: `scale(${scale})`,
 }}
 >
 <CinematicText 
 text="NETFLIX" 
 fontSize={150} 
 tracking={10}
 color="#E50914" 
 />
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
