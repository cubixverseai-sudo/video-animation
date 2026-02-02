import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR_PALETTE } from '../constants';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(spr, [0, 1], [0.8, 1]);
  
  const words = ["HASSAN", "THE", "BEAST"];

  return (
    <div style={{
      flex: 1,
      backgroundColor: COLOR_PALETTE.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      fontWeight: 900,
      color: COLOR_PALETTE.text,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center, ${COLOR_PALETTE.accent}33 0%, transparent 70%)`,
        opacity: interpolate(frame, [0, 30], [0, 0.5]),
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${scale})`,
        gap: '20px',
      }}>
        {words.map((word, i) => {
          const wordSpring = spring({
            frame: frame - (i * 5),
            fps,
            config: { stiffness: 100 },
          });
          
          const y = interpolate(wordSpring, [0, 1], [50, 0]);
          const opacity = interpolate(wordSpring, [0, 1], [0, 1]);

          return (
            <div key={word} style={{
              fontSize: word === "BEAST" ? '180px' : '120px',
              lineHeight: 0.9,
              letterSpacing: '-0.05em',
              opacity,
              transform: `translateY(${y}px)`,
              color: word === "BEAST" ? COLOR_PALETTE.accent : COLOR_PALETTE.text,
              textShadow: word === "BEAST" ? `0 0 40px ${COLOR_PALETTE.accent}66` : 'none',
            }}>
              {word}
            </div>
          );
        })}
      </div>
    </div>
  );
};
