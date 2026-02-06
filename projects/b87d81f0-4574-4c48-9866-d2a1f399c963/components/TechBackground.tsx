import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const TechBackground: React.FC = () => {
 const frame = useCurrentFrame();
 
 // Grid movement
 const gridOffset = interpolate(frame, [0, 300], [0, 50]);
 
 return (
 <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden', zIndex: 0 }}>
 {/* Subtle Grid */}
 <div
 style={{ position: 'absolute',
 top: -50,
 left: -50,
 width: '120%',
 height: '120%',
 backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
 linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
 backgroundSize: '100px 100px',
 transform: `translateY(${gridOffset}px) perspective(500px) rotateX(20deg)`,
 opacity: 0.5,
 }}
 />
 
 {/* Ambient Glows */}
 <div
 style={{ position: 'absolute',
 top: '20%',
 left: '20%',
 width: 400,
 height: 400,
 background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
 filter: 'blur(60px)',
 opacity: 0.6,
 }}
 />
 <div
 style={{ position: 'absolute',
 bottom: '10%',
 right: '10%',
 width: 500,
 height: 500,
 background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
 filter: 'blur(80px)',
 opacity: 0.5,
 }}
 />
 </AbsoluteFill>
 );
};
