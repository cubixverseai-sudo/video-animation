import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Img, staticFile } from 'remotion';
import { GlassCard } from '../components/GlassCard';
import { ParticleField } from '../components/ParticleField';

export const ProcessScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps, width, height } = useVideoConfig();

 const switchFrame = 40;
 
 // Slide Transition Logic
 const slideOffset = interpolate(frame, [switchFrame, switchFrame + 20], [0, -width * 0.6], {
 extrapolateRight: 'clamp',
 easing: (t) => t * t * (3 - 2 * t), // Smoothstep
 });

 const card2Enter = interpolate(frame, [switchFrame, switchFrame + 20], [width * 0.6, 0], {
 extrapolateRight: 'clamp',
 easing: (t) => t * t * (3 - 2 * t),
 });

 return (
 <AbsoluteFill style={{ backgroundColor: '#020205' }}>
 <ParticleField color="#ec4899" speed={0.8} />
 
 {/* Background Glows */}
 <div style={{ position: 'absolute',
 top: -200, left: '20%',
 width: 600, height: 600,
 background: 'radial-gradient(circle, #ec489930 0%, transparent 70%)',
 filter: 'blur(50px)',
 }} />

 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
 
 {/* Container for sliding mechanism */}
 <div style={{ display: 'flex', 
 width: width * 1.5, 
 height: height * 0.6,
 alignItems: 'center',
 justifyContent: 'center',
 transform: `translateX(${slideOffset}px)`
 }}>
 
 {/* Card 1: Generation */}
 <div style={{ position: 'relative', width: width * 0.5, height: '100%', marginRight: 100 }}>
 <GlassCard style={{ width: '100%', height: '100%', border: '1px solid #ffffff20' }}>
 <Img src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/images/step-2.jpeg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(0,0,0,0.7)', padding: '5px 15px', borderRadius: 4, color: '#fff', fontFamily: 'monospace' }}>
 &gt; GENERATING_WORLD...
 </div>
 </GlassCard>
 </div>

 {/* Card 2: Final Result */}
 <div style={{ position: 'relative', width: width * 0.5, height: '100%', transform: `translateX(${card2Enter}px)` }}>
 <GlassCard style={{ width: '100%', height: '100%', border: '1px solid #ec489940', boxShadow: '0 0 30px #ec489920' }}>
 <Img src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/images/step-3.jpeg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 <div style={{ position: 'absolute', bottom: 20, right: 20, background: '#ec4899', padding: '5px 15px', borderRadius: 4, color: '#fff', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
 RENDER COMPLETE
 </div>
 </GlassCard>
 </div>

 </div>

 {/* Central Overlay Text */}
 <div style={{ position: 'absolute',
 top: 100,
 width: '100%',
 textAlign: 'center',
 fontFamily: 'Inter, sans-serif',
 fontSize: 48,
 fontWeight: 300,
 letterSpacing: 10,
 color: '#fff',
 textShadow: '0 0 20px rgba(255,255,255,0.5)',
 opacity: interpolate(frame, [0, 20], [0, 1]),
 }}>
 INTELLIGENT PROCESS
 </div>

 </AbsoluteFill>
 </AbsoluteFill>
 );
};
