import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { TechBackground } from '../components/TechBackground';
import { Cursor } from '../components/Cursor';

export const TitleScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 // Typing effect
 const fullText = "Turn Ideas into Video";
 const charsToShow = Math.floor(interpolate(frame, [10, 50], [0, fullText.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
 const textToShow = fullText.substring(0, charsToShow);

 // Slide up effect
 const slideUp = spring({
 frame: frame - 55,
 fps,
 config: { damping: 20 },
 });
 
 const yOffset = interpolate(slideUp, [0, 1], [50, 0]);
 const opacity = interpolate(slideUp, [0, 1], [0, 1]);

 // Subtitle
 const subOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: 'clamp' });

 return (
 <AbsoluteFill>
 <TechBackground />
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 
 {/* Main Typing Text */}
 <div style={{ fontFamily: 'Inter, sans-serif', 
 fontSize: 80, 
 fontWeight: 700, 
 color: '#fff',
 letterSpacing: '-0.02em',
 display: 'flex',
 alignItems: 'center'
 }}>
 {textToShow}<Cursor />
 </div>

 {/* Subtitle slide up */}
 <div style={{ marginTop: 20,
 fontFamily: 'Inter, sans-serif',
 fontSize: 32,
 fontWeight: 400,
 color: '#a78bfa', // Light purple
 opacity: subOpacity,
 transform: `translateY(${20 * (1 - subOpacity)}px)`
 }}>
 AI-Powered Video Creation Platform
 </div>

 </AbsoluteFill>
 </AbsoluteFill>
 );
};
