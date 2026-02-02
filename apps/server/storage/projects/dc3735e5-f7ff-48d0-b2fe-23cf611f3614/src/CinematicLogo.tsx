import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { Logo } from './components/Logo';
import { Typography } from './components/Typography';
import { Particles } from './components/Particles';

export const CinematicLogo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
      <Background />
      <Particles />

      {/* Cinematic Light Flare */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <Logo />

      <Typography
        text="STORIA"
        subtext="Digital Storytelling Redefined"

      />

      {/* Edge Vignette */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
