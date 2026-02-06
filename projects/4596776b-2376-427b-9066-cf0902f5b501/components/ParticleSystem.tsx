import React, { useMemo } from 'react';
import { AbsoluteFill, random, interpolate, useCurrentFrame } from 'remotion';

export const ParticleSystem: React.FC<{ count?: number }> = ({ count = 50 }) => {
 const frame = useCurrentFrame();
 
 const particles = useMemo(() => {
 return new Array(count).fill(0).map((_, i) => {
 const x = random(`x-${i}`) * 100;
 const y = random(`y-${i}`) * 100;
 const size = random(`size-${i}`) * 3 + 1;
 const speed = random(`speed-${i}`) * 0.5 + 0.1;
 const opacity = random(`opacity-${i}`) * 0.5 + 0.2;
 return { x, y, size, speed, opacity };
 });
 }, [count]);

 return (
 <AbsoluteFill>
 {particles.map((p, i) => {
 const yPos = (p.y - frame * p.speed) % 100;
 const actualY = yPos < 0 ? 100 + yPos : yPos;
 
 return (
 <div
 key={i}
 style={{ position: 'absolute',
 left: `${p.x}%`,
 top: `${actualY}%`,
 width: p.size,
 height: p.size,
 borderRadius: '50%',
 backgroundColor: '#fff',
 opacity: p.opacity,
 boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.5)`
 }}
 />
 );
 })}
 </AbsoluteFill>
 );
};
