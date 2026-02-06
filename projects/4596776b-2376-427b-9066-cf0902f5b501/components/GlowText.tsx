import React from 'react';

interface GlowTextProps {
 text: string;
 fontSize?: number;
 color?: string;
 glowColor?: string;
 style?: React.CSSProperties;
}

export const GlowText: React.FC<GlowTextProps> = ({ 
 text, 
 fontSize = 80, 
 color = '#ffffff', 
 glowColor = 'rgba(255, 255, 255, 0.6)',
 style 
}) => {
 return (
 <div style={{ position: 'relative', display: 'inline-block', ...style }}>
 {/* Glow Layer */}
 <div
 style={{ position: 'absolute',
 top: 0,
 left: 0,
 color: color,
 fontSize,
 fontFamily: 'Inter, sans-serif',
 fontWeight: 800,
 filter: `blur(15px) drop-shadow(0 0 20px ${glowColor})`,
 opacity: 0.7,
 width: '100%',
 textAlign: 'center'
 }}
 >
 {text}
 </div>
 
 {/* Main Text Layer */}
 <div
 style={{ position: 'relative',
 color: color,
 fontSize,
 fontFamily: 'Inter, sans-serif',
 fontWeight: 800,
 zIndex: 1,
 textAlign: 'center',
 textShadow: `0 0 10px ${glowColor}`
 }}
 >
 {text}
 </div>
 </div>
 );
};
