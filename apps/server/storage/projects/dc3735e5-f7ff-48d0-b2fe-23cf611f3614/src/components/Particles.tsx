import React, { useMemo } from 'react';
import { AbsoluteFill, useVideoConfig, random, interpolate, useCurrentFrame } from 'remotion';

export const Particles: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    return new Array(50).fill(0).map((_, i) => ({
      x: random(`x-${i}`) * width,
      y: random(`y-${i}`) * height,
      size: random(`s-${i}`) * 3 + 1,
      speed: random(`sp-${i}`) * 2 + 0.5,
      opacity: random(`o-${i}`) * 0.5 + 0.2,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill>
      {particles.map((p, i) => {
        const yPos = (p.y - frame * p.speed) % height;
        const opacity = interpolate(
          frame,
          [0, 20],
          [0, p.opacity],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: yPos < 0 ? yPos + height : yPos,
              width: p.size,
              height: p.size,
              backgroundColor: 'white',
              borderRadius: '50%',
              opacity,
              boxShadow: '0 0 10px white',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
