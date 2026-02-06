import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const ContentPulse: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 // Slide in effect for "BEST"
 const slideIn1 = spring({
 frame: frame - 5,
 fps,
 config: { damping: 15, stiffness: 120 },
 });

 const xOffset1 = interpolate(slideIn1, [0, 1], [-500, 0]);

 // Slide in effect for "ANIMATION"
 const slideIn2 = spring({
 frame: frame - 15,
 fps,
 config: { damping: 15, stiffness: 120 },
 });

 const xOffset2 = interpolate(slideIn2, [0, 1], [500, 0]);

 return (
 <AbsoluteFill
 style={{ backgroundColor: '#ffffff', // Invert for impact: White BG, Black/Red Text
 justifyContent: 'center',
 alignItems: 'center',
 flexDirection: 'column',
 }}
 >
 <div style={{ overflow: 'hidden', height: 120, display: 'flex', alignItems: 'center' }}>
 <h1
 style={{ fontFamily: 'Inter, sans-serif',
 fontSize: 100,
 fontWeight: 900,
 color: '#000000',
 margin: 0,
 transform: `translateX(${xOffset1}px)`,
 lineHeight: 1,
 }}
 >
 BEST
 </h1>
 </div>
 
 <div style={{ overflow: 'hidden', height: 120, display: 'flex', alignItems: 'center' }}>
 <h1
 style={{ fontFamily: 'Inter, sans-serif',
 fontSize: 100,
 fontWeight: 900,
 color: '#E50914',
 margin: 0,
 transform: `translateX(${xOffset2}px)`,
 lineHeight: 1,
 }}
 >
 ANIMATION
 </h1>
 </div>
 </AbsoluteFill>
 );
};
