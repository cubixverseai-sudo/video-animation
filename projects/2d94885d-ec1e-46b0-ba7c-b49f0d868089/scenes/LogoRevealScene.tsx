import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const LogoRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoPath = staticFile('assets/2d94885d-ec1e-46b0-ba7c-b49f0d868089/images/storia-logo-white.png');

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    from: 0,
    to: 1
  });

  const glowOpacity = interpolate(frame, [0, 20, 40], [0, 0.8, 0]);
  const textOpacity = interpolate(frame, [30, 60], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,0,204,0.8) 0%, rgba(0,0,0,0) 70%)', opacity: glowOpacity, transform: `scale(${scale * 2})` }} />
      
      <Img src={logoPath} style={{ width: 500, objectFit: 'contain', transform: `scale(${scale})`, zIndex: 10, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }} />
      
      <div style={{ opacity: textOpacity, marginTop: 40, fontFamily: 'sans-serif', color: '#aaa', fontSize: 24, letterSpacing: 2 }}>
        IMAGINATION INTO REALITY
      </div>
    </AbsoluteFill>
  );
};
