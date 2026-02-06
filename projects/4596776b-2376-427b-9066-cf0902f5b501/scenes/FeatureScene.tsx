import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { ParticleSystem } from '../components/ParticleSystem';
import { GlowText } from '../components/GlowText';

export const FeatureScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 // Three sections: 0-40, 40-80, 80-120
 const phase1 = spring({ frame: frame - 10, fps, config: { damping: 15 } });
 const phase2 = spring({ frame: frame - 50, fps, config: { damping: 15 } });
 const phase3 = spring({ frame: frame - 90, fps, config: { damping: 15 } });

 // Opacity transitions
 const op1 = interpolate(frame, [10, 20, 45, 50], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
 const op2 = interpolate(frame, [50, 60, 85, 90], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
 const op3 = interpolate(frame, [90, 100], [0, 1], { extrapolateRight: 'clamp' }); // Stays on screen till end of scene

 // Scale effects
 const scale1 = interpolate(phase1, [0, 1], [0.8, 1]);
 const scale2 = interpolate(phase2, [0, 1], [0.8, 1]);
 const scale3 = interpolate(phase3, [0, 1], [0.5, 1.2]); // Big finish

 return (
 <AbsoluteFill>
 <GradientBackground />
 <ParticleSystem count={80} /> {/* More chaotic */}

 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 
 {/* Word 1: MOVIES */}
 <div style={{ position: 'absolute', opacity: op1, transform: `scale(${scale1})` }}>
 <GlowText text="MOVIES" fontSize={150} glowColor="#ff0055" />
 </div>

 {/* Word 2: SERIES */}
 <div style={{ position: 'absolute', opacity: op2, transform: `scale(${scale2})` }}>
 <GlowText text="SERIES" fontSize={150} glowColor="#0055ff" />
 </div>

 {/* Word 3: ORIGINALS */}
 <div style={{ position: 'absolute', opacity: op3, transform: `scale(${scale3})` }}>
 <GlowText text="ORIGINALS" fontSize={140} glowColor="#aa00ff" />
 </div>

 </AbsoluteFill>
 </AbsoluteFill>
 );
};
