import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Img, staticFile } from 'remotion';
import { ParticleField } from '../components/ParticleField';

export const LogoRevealScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps, width, height } = useVideoConfig();

 const scale = spring({ frame, fps, config: { damping: 100, mass: 2 } });
 
 // Light sweep effect
 const sweep = interpolate(frame, [30, 60], [-100, 200]);
 
 const opacity = interpolate(frame, [0, 20], [0, 1]);

 return (
 <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
 <ParticleField color="#ffffff" speed={0.2} />
 
 {/* Cinematic Spotlight */}
 <div style={{ position: 'absolute',
 top: '50%', left: '50%',
 width: '120vw', height: 400,
 background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
 transform: 'translate(-50%, -50%)',
 }} />

 {/* Main Logo Container */}
 <div style={{ position: 'relative', opacity, transform: `scale(${scale})` }}>
 <Img
 src={staticFile('assets/a5acdc32-c73f-43cf-a5c6-ad3c38651579/images/storia-logo-white.png')}
 style={{ width: 500, objectFit: 'contain' }}
 />
 
 {/* Shine Effect - Masked to Logo via mix-blend-mode or clip-path if image was SVG, 
 here we use an overlay sweep for the whole container */}
 <div style={{ position: 'absolute',
 top: 0,
 left: 0,
 width: '100%',
 height: '100%',
 background: `linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`,
 transform: `translateX(${sweep}%)`,
 mixBlendMode: 'overlay',
 }} />
 </div>

 {/* Tagline */}
 <div style={{ marginTop: 40,
 fontFamily: 'Inter, sans-serif',
 fontSize: 24,
 letterSpacing: 8,
 color: '#888',
 opacity: interpolate(frame, [40, 60], [0, 1]),
 transform: `translateY(${interpolate(frame, [40, 60], [20, 0], { extrapolateRight: 'clamp' })}px)`,
 }}>
 CREATE. GENERATE. INSPIRE.
 </div>
 
 {/* Bottom CTA */}
 <div style={{ position: 'absolute',
 bottom: 80,
 fontFamily: 'monospace',
 fontSize: 16,
 color: '#444',
 }}>
 STORIA.AI
 </div>

 </AbsoluteFill>
 );
};
