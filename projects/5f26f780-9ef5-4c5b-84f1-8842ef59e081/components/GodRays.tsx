import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const GodRays: React.FC<{ color?: string }> = ({ color = '#E50914' }) => {
 const frame = useCurrentFrame();
 const rotation = interpolate(frame, [0, 300], [0, 360]);
 
 return (
 <AbsoluteFill style={{ overflow: 'hidden' }}>
 <div
 style={{ position: 'absolute',
 width: '200%',
 height: '200%',
 left: '-50%',
 top: '-50%',
 background: `conic-gradient(from 0deg, transparent 0deg, ${color}20 10deg, transparent 20deg, ${color}10 50deg, transparent 60deg)`,
 transform: `rotate(${rotation}deg)`,
 filter: 'blur(50px)',
 opacity: 0.3,
 }}
 />
 </AbsoluteFill>
 );
};
