import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ScanLine: React.FC<{ color?: string }> = ({ color = '#fff' }) => {
 const frame = useCurrentFrame();
 
 const top = interpolate(frame % 90, [0, 90], [-10, 110]);
 const opacity = interpolate(frame % 90, [0, 10, 80, 90], [0, 1, 1, 0]);

 return (
 <AbsoluteFill style={{ pointerEvents: 'none' }}>
 <div
 style={{ position: 'absolute',
 left: 0,
 right: 0,
 top: `${top}%`,
 height: 2,
 backgroundColor: color,
 boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
 opacity: opacity * 0.5,
 filter: 'blur(1px)',
 }}
 />
 </AbsoluteFill>
 );
};
