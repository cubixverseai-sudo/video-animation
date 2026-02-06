import React from 'react';
import { AbsoluteFill } from 'remotion';

interface GlowContainerProps {
 children: React.ReactNode;
 color?: string;
 blur?: number;
 opacity?: number;
 scale?: number;
}

export const GlowContainer: React.FC<GlowContainerProps> = ({ 
 children, 
 color = '#E50914', 
 blur = 20, 
 opacity = 1,
 scale = 1
}) => {
 return (
 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
 {/* Glow Layer */}
 <div
 style={{ position: 'absolute',
 transform: `scale(${scale * 1.2})`,
 filter: `blur(${blur}px)`,
 opacity: opacity * 0.6,
 zIndex: 0,
 }}
 >
 {children}
 </div>
 
 {/* Content Layer */}
 <div style={{ position: 'absolute', transform: `scale(${scale})`, zIndex: 1, opacity }}>
 {children}
 </div>
 </AbsoluteFill>
 );
};
