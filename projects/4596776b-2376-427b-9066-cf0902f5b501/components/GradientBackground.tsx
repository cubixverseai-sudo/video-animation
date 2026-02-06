import React from 'react';
import { AbsoluteFill } from 'remotion';

export const GradientBackground: React.FC = () => {
 return (
 <AbsoluteFill
 style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)',
 zIndex: -1,
 }}
 />
 );
};
