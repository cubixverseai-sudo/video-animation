import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        width,
        height,
        backgroundColor: '#050505',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 70%),
          radial-gradient(circle at 20% 20%, #111 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, #111 0%, transparent 40%)
        `,
        opacity,
        transform: `scale(${interpolate(frame, [0, 300], [1, 1.1])})`,
      }}
    />
  );
};
