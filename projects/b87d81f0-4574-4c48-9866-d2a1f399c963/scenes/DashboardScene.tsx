import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile, useVideoConfig } from 'remotion';
import { TechBackground } from '../components/TechBackground';

export const DashboardScene: React.FC = () => {
 const frame = useCurrentFrame();
 const { width, height } = useVideoConfig();

 const step1 = staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/images/step-1.jpeg');
 const step2 = staticFile('assets/b87d81f0-4574-4c48-9866-d2a1f399c963/images/step-2.jpeg');

 // Reveal scan line position (0 to 100%)
 const scanProgress = interpolate(frame, [30, 90], [0, 100], {
 extrapolateLeft: 'clamp',
 extrapolateRight: 'clamp',
 });

 // Scale animation for the dashboard container
 const scale = interpolate(frame, [0, 120], [0.95, 1.05], { extrapolateRight: 'clamp' });
 
 // Dashboard container dimensions
 const dashWidth = width * 0.8;
 const dashHeight = height * 0.8;

 return (
 <AbsoluteFill>
 <TechBackground />
 
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 
 {/* Container with shadow and border */}
 <div style={{ width: dashWidth,
 height: dashHeight,
 position: 'relative',
 borderRadius: 16,
 overflow: 'hidden',
 boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
 border: '1px solid rgba(255,255,255,0.1)',
 transform: `scale(${scale})`,
 }}>
 
 {/* Layer 1: The Script Input (Step 1) */}
 <AbsoluteFill>
 <Img src={step1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 {/* Dim overlay when scanned */}
 <div style={{ position: 'absolute', inset: 0, 
 backgroundColor: 'rgba(0,0,0,0.5)', 
 opacity: interpolate(scanProgress, [0, 100], [0, 0.8]) 
 }} />
 </AbsoluteFill>

 {/* Layer 2: The Video Result (Step 2) - Masked by scan */}
 <AbsoluteFill style={{ clipPath: `polygon(0 0, 100% 0, 100% ${scanProgress}%, 0 ${scanProgress}%)`,
 }}>
 <Img src={step2} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 </AbsoluteFill>

 {/* Scan Line */}
 <div style={{ position: 'absolute',
 top: `${scanProgress}%`,
 left: 0,
 width: '100%',
 height: 4,
 background: 'linear-gradient(90deg, transparent, #ec4899, #8b5cf6, transparent)',
 boxShadow: '0 0 20px #ec4899',
 opacity: interpolate(frame, [20, 30, 90, 100], [0, 1, 1, 0]),
 zIndex: 10,
 }} />
 
 {/* UI Badge Overlay */}
 <div style={{ position: 'absolute',
 bottom: 30,
 right: 30,
 backgroundColor: 'rgba(0,0,0,0.8)',
 padding: '10px 20px',
 borderRadius: 30,
 border: '1px solid rgba(255,255,255,0.2)',
 color: '#fff',
 fontFamily: 'Inter, sans-serif',
 fontSize: 16,
 fontWeight: 600,
 opacity: interpolate(frame, [80, 100], [0, 1]),
 transform: `translateY(${interpolate(frame, [80, 100], [20, 0])}px)`
 }}>
 ✨ AI Generated
 </div>

 </div>
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
