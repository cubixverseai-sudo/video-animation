import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Img } from 'remotion';
import { COLOR_PALETTE, getAssetPath } from '../constants';

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  const float = Math.sin(frame / 20) * 20;
  const rotateY = interpolate(frame, [0, 150], [-5, 5]);
  const rotateX = interpolate(frame, [0, 150], [5, -5]);

  return (
    <div style={{
      flex: 1,
      backgroundColor: COLOR_PALETTE.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      perspective: '1200px',
    }}>
      <div style={{
        width: '80%',
        height: '70%',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 30px 100px rgba(0,0,0,0.8), 0 0 40px ${COLOR_PALETTE.accent}22`,
        transform: `
          scale(${interpolate(entrance, [0, 1], [0.8, 1])}) 
          rotateY(${rotateY}deg) 
          rotateX(${rotateX}deg)
          translateY(${float}px)
        `,
        border: `1px solid ${COLOR_PALETTE.accent}44`,
      }}>
        <Img 
          src={staticFile(getAssetPath('step-6.jpeg'))} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 100,
        fontFamily: 'Inter, sans-serif',
        color: COLOR_PALETTE.text,
        fontSize: '40px',
        fontWeight: 700,
        opacity: entrance,
      }}>
        <div style={{ width: '40px', height: '4px', backgroundColor: COLOR_PALETTE.accent, marginBottom: '10px' }} />
        LIVE ANALYTICS
      </div>
    </div>
  );
};
