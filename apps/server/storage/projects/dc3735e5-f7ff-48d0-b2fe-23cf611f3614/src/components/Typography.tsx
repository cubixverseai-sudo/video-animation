import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const Typography: React.FC<{ text: string; subtext?: string }> = ({ text, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const moveUp = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15 },
  });

  const translateY = interpolate(moveUp, [0, 1], [50, 0]);
  const opacity = interpolate(moveUp, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '15%',
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Inter, Helvetica, sans-serif',
        color: 'white',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <h1 style={{
        fontSize: '80px',
        fontWeight: 900,
        margin: 0,
        letterSpacing: '-2px',
        textTransform: 'uppercase',
      }}>
        {text}
      </h1>
      {subtext && (
        <p style={{
          fontSize: '24px',
          fontWeight: 300,
          margin: '10px 0 0',
          opacity: 0.7,
          letterSpacing: '5px',
          textTransform: 'uppercase',
        }}>
          {subtext}
        </p>
      )}
    </div>
  );
};
