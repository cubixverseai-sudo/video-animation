import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Img } from 'remotion';
import { COLOR_PALETTE, getAssetPath } from '../constants';

export const LogoOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const logoScale = interpolate(spr, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [0, 20], [0, 1]);
  
  const bgScale = interpolate(frame, [0, 150], [1, 1.2]);

  return (
    <div style={{
      flex: 1,
      backgroundColor: COLOR_PALETTE.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLOR_PALETTE.accent}22 0%, transparent 70%)`,
        transform: `scale(${bgScale})`,
      }} />

      <div style={{
        width: '400px',
        height: '400px',
        borderRadius: '100px',
        overflow: 'hidden',
        boxShadow: `0 0 80px ${COLOR_PALETTE.accent}33`,
        transform: `scale(${logoScale})`,
        opacity: logoOpacity,
        border: `2px solid ${COLOR_PALETTE.accent}22`,
      }}>
        <Img 
          src={staticFile(getAssetPath('Logo-Animation.jpeg'))} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      <div style={{
        marginTop: '60px',
        color: COLOR_PALETTE.text,
        fontFamily: 'Inter, sans-serif',
        fontSize: '48px',
        fontWeight: 800,
        letterSpacing: '0.2em',
        opacity: interpolate(frame, [20, 40], [0, 1]),
        transform: `translateY(${interpolate(frame, [20, 40], [20, 0])}px)`,
      }}>
        THE BEAST
      </div>
    </div>
  );
};
