import React, { useMemo } from 'react';
import { random, AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const ParticleField: React.FC<{ speed?: number, color?: string }> = ({ speed = 1, color = '#ffffff' }) => {
 const frame = useCurrentFrame();
 const { width, height } = useVideoConfig();

 const particles = useMemo(() => {
 return new Array(40).fill(true).map((_, i) => {
 const x = random(`x-${i}`) * width;
 const y = random(`y-${i}`) * height;
 const size = random(`size-${i}`) * 3 + 1;
 const opacity = random(`opacity-${i}`) * 0.5 + 0.1;
 return { x, y, size, opacity };
 });
 }, [width, height]);

 return (
 <AbsoluteFill style={{ pointerEvents: 'none' }}>
 {particles.map((p, i) => {
 const yPos = (p.y - frame * speed * (p.size / 2)) % height;
 const finalY = yPos < 0 ? yPos + height : yPos;
 
 return (
 <div
 key={i}
 style={{ position: 'absolute',
 left: p.x,
 top: finalY,
 width: p.size,
 height: p.size,
 borderRadius: '50%',
 backgroundColor: color,
 opacity: p.opacity,
 boxShadow: `0 0 ${p.size * 2}px ${color}`,
 }}
 />
 );
 })}
 </AbsoluteFill>
 );
};
