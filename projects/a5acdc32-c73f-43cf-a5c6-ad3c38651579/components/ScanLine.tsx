import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

export const ScanLine: React.FC<{ color?: string, speed?: number }> = ({ color = '#60a5fa', speed = 60 }) => {
 const frame = useCurrentFrame();
 const { height } = useVideoConfig();

 const progress = (frame % speed) / speed;
 const top = interpolate(progress, [0, 1], [0, height]);
 const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

 return (
 <AbsoluteFill style={{ pointerEvents: 'none' }}>
 <div
 style={{ position: 'absolute',
 top,
 left: 0,
 right: 0,
 height: 2,
 backgroundColor: color,
 opacity,
 boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
 }}
 />
 <div
 style={{ position: 'absolute',
 top,
 left: 0,
 right: 0,
 height: 100,
 background: `linear-gradient(to bottom, ${color}00, ${color}20)`,
 opacity,
 transform: 'translateY(-100%)',
 }}
 />
 </AbsoluteFill>
 );
};
