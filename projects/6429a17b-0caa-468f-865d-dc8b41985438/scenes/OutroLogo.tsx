import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

export const OutroLogo: React.FC = () => {
 const frame = useCurrentFrame();
 
 const opacity = interpolate(frame, [0, 15], [0, 1]);
 // Removed explicit extrapolate to simplify brace counting for tool
 const scale = interpolate(frame, [0, 30], [0.9, 1]);

 return (
 <AbsoluteFill style={{ backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
 <div style={{ opacity: opacity, transform: 'scale(' + scale + ')', textAlign: 'center' }}>
 <h2 style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 40, fontWeight: 400, marginBottom: 20, letterSpacing: 4 }}>
 EXPERIENCE IT
 </h2>
 <h1 style={{ color: '#E50914', fontFamily: 'Inter', fontSize: 100, fontWeight: 900, margin: 0 }}>
 WATCH NOW
 </h1>
 </div>
 </AbsoluteFill>
 );
};
