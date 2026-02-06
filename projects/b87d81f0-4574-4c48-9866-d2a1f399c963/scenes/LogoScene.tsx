import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile, spring, useVideoConfig } from 'remotion';
import { TechBackground } from '../components/TechBackground';

export const LogoScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const logo = staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/images/storia-logo-white.png');

 // Entrance
 const spr = spring({
 frame,
 fps,
 config: { damping: 15, mass: 0.5 },
 });

 const scale = interpolate(spr, [0, 1], [0.5, 1]);
 const opacity = interpolate(spr, [0, 1], [0, 1]);
 
 // Continuous float
 const float = Math.sin(frame / 20) * 10;

 return (
 <AbsoluteFill>
 <TechBackground />
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 
 {/* Glow behind logo */}
 <div style={{ position: 'absolute',
 width: 300,
 height: 300,
 backgroundColor: 'rgba(255, 255, 255, 0.2)',
 filter: 'blur(100px)',
 borderRadius: '50%',
 opacity: opacity * 0.5,
 transform: `scale(${scale})`
 }} />

 {/* Logo */}
 <Img 
 src={logo} 
 style={{ width: 400, 
 objectFit: 'contain',
 transform: `scale(${scale}) translateY(${float}px)`,
 opacity
 }} 
 />

 {/* CTA Button */}
 <div style={{ marginTop: 60,
 padding: '16px 40px',
 background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
 borderRadius: 50,
 color: 'white',
 fontFamily: 'Inter, sans-serif',
 fontWeight: 700,
 fontSize: 24,
 opacity: interpolate(frame, [20, 40], [0, 1]),
 transform: `translateY(${interpolate(frame, [20, 40], [20, 0])}px)`,
 boxShadow: '0 10px 30px rgba(236, 72, 153, 0.4)'
 }}>
 Create with Storia
 </div>

 </AbsoluteFill>
 </AbsoluteFill>
 );
};
