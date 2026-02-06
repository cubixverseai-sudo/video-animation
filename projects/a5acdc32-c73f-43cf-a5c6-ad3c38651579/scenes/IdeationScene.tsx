import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Img, staticFile } from 'remotion';
import { GlassCard } from '../components/GlassCard';
import { ParticleField } from '../components/ParticleField';

export const IdeationScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps, width, height } = useVideoConfig();

 // 3D Tilt Effect
 const tilt = interpolate(frame, [0, 100], [5, -5]);
 const scale = interpolate(frame, [0, 100], [0.9, 1]);
 
 const opacity = interpolate(frame, [0, 20], [0, 1]);
 const textY = spring({ frame: frame - 10, fps, config: { damping: 12 } });
 const textVal = interpolate(textY, [0, 1], [50, 0]);

 return (
 <AbsoluteFill style={{ backgroundColor: '#020205', overflow: 'hidden' }}>
 <ParticleField color="#8b5cf6" speed={0.5} />
 
 {/* Dynamic Background Gradient */}
 <AbsoluteFill style={{ background: 'radial-gradient(circle at 20% 50%, #2e1065 0%, transparent 50%)',
 opacity: 0.4,
 }} />

 <AbsoluteFill style={{ perspective: 1000, 
 justifyContent: 'center', 
 alignItems: 'center' 
 }}>
 <div style={{ transform: `rotateY(${tilt}deg) scale(${scale})`,
 transformStyle: 'preserve-3d',
 }}>
 <GlassCard
 style={{ width: width * 0.75,
 height: height * 0.65,
 opacity,
 boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
 border: '1px solid rgba(255,255,255,0.15)',
 }}
 >
 <Img
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/images/step-1.jpeg')}
 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
 />
 
 {/* Professional Grid Overlay */}
 <div style={{ position: 'absolute',
 inset: 0,
 backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
 backgroundSize: '50px 50px',
 pointerEvents: 'none',
 }} />
 </GlassCard>
 </div>

 {/* Text Container */}
 <div style={{ position: 'absolute',
 bottom: 120,
 left: 100,
 opacity: Math.min(1, Math.max(0, interpolate(frame, [10, 30], [0, 1]))),
 transform: `translateY(${textVal}px)`
 }}>
 <h1 style={{ fontFamily: 'Inter, sans-serif',
 fontSize: 72,
 fontWeight: 800,
 color: 'white',
 margin: 0,
 lineHeight: 1,
 letterSpacing: '-2px',
 }}>
 IDEATION
 </h1>
 <div style={{ height: 4,
 width: 100,
 background: '#ec4899',
 marginTop: 10,
 boxShadow: '0 0 10px #ec4899'
 }} />
 </div>
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
