import React from 'react';
import { AbsoluteFill } from 'remotion';

export const ChromaticAberration: React.FC<{
 offset: number;
 children: React.ReactNode;
}> = ({ offset, children }) => {
 return (
 <AbsoluteFill>
 <AbsoluteFill style={{ transform: `translate(${-offset}px, 0)`, mixBlendMode: 'screen' }}>
 <div style={{ color: '#ff0000', filter: 'opacity(0.8)' }}>
 {/* Note: This is a simplified simulation. True chromatic aberration requires separate layers.
 For this component, we assume the children are providing the visual structure.
 Better approach for images: Render the image 3 times with different filters.
 */}
 {children}
 </div>
 </AbsoluteFill>
 
 <AbsoluteFill style={{ transform: `translate(${offset}px, 0)`, mixBlendMode: 'screen' }}>
 <div style={{ color: '#00ffff', filter: 'opacity(0.8)' }}>
 {children}
 </div>
 </AbsoluteFill>
 
 <AbsoluteFill style={{ mixBlendMode: 'normal' }}>
 {children}
 </AbsoluteFill>
 </AbsoluteFill>
 );
};
