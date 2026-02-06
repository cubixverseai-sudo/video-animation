import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { ParticleSystem } from '../components/ParticleSystem';
import { GlowText } from '../components/GlowText';

export const LogoScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const entrance = spring({ frame, fps, config: { damping: 10, mass: 1 } });
 
 const scale = interpolate(entrance, [0, 1], [0, 1]);
 const rotate = interpolate(entrance, [0, 1], [-90, 0]);
 
 const textOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
 const textY = interpolate(frame, [20, 40], [50, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

 return (
 <AbsoluteFill>
 <GradientBackground />
 <ParticleSystem count={30} />
 
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 
 {/* Logo Icon */}
 <div style={{ transform: `scale(${scale}) rotate(${rotate}deg)`,
 marginBottom: 40,
 display: 'flex',
 justifyContent: 'center',
 alignItems: 'center'
 }}>
 {/* Circle */}
 <div style={{ width: 150,
 height: 150,
 borderRadius: '50%',
 border: '5px solid #fff',
 display: 'flex',
 justifyContent: 'center',
 alignItems: 'center',
 boxShadow: '0 0 30px rgba(255,255,255,0.3)',
 background: 'linear-gradient(45deg, #222, #444)'
 }}>
 {/* Play Triangle */}
 <div style={{ width: 0,
 height: 0,
 borderTop: '30px solid transparent',
 borderBottom: '30px solid transparent',
 borderLeft: '50px solid #fff',
 marginLeft: 15
 }} />
 </div>
 </div>

 {/* Brand Name */}
 <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}>
 <GlowText 
 text="SHAHID" 
 fontSize={100} 
 color="#fff"
 glowColor="rgba(255,255,255,0.8)"
 style={{ letterSpacing: 10 }}
 />
 </div>

 </AbsoluteFill>
 </AbsoluteFill>
 );
};
