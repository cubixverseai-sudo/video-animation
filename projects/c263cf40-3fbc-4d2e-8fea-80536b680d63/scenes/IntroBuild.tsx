import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill, random, Sequence } from 'remotion';

export const IntroBuild: React.FC = () => {
 const frame = useCurrentFrame();
 const { width, height } = useVideoConfig();

 // Generate random vertical lines
 const lines = useMemo(() => {
 return new Array(20).fill(0).map((_, i) => {
 const seed = `line-${i}`;
 return {
 x: random(seed) * width,
 width: 1 + random(seed + 'w') * 2,
 height: height * (0.2 + random(seed + 'h') * 0.5),
 delay: random(seed + 'd') * 60,
 speed: 0.5 + random(seed + 's'),
 };
 });
 }, [width, height]);

 const opacity = interpolate(frame, [0, 20], [0, 1]);

 return (
 <AbsoluteFill style={{ backgroundColor: '#000000' }}>
 {lines.map((line, i) => {
 const lineProgress = Math.max(0, frame - line.delay);
 const yPos = interpolate(
 lineProgress,
 [0, 120],
 [height + line.height, -line.height],
 { extrapolateRight: 'extend' }
 );
 
 const lineOpacity = interpolate(
 lineProgress,
 [0, 20, 100, 120],
 [0, 0.4, 0.4, 0],
 { extrapolateRight: 'clamp' }
 );

 return (
 <div
 key={i}
 style={{ position: 'absolute',
 left: line.x,
 top: yPos,
 width: line.width,
 height: line.height,
 backgroundColor: 'rgba(255, 255, 255, 0.15)',
 opacity: lineOpacity,
 boxShadow: '0 0 10px rgba(255,255,255,0.2)',
 }}
 />
 );
 })}
 
 {/* Central focus build up */}
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 <div style={{ width: 200,
 height: 200,
 borderRadius: '50%',
 background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
 opacity: interpolate(frame, [60, 120], [0, 1]),
 transform: `scale(${interpolate(frame, [60, 120], [0.5, 1.5])})`
 }} />
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
