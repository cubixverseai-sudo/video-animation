import React, { useMemo } from 'react';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';

export const ParticleField: React.FC<{ count: number; speed: number; color: string }> = ({ count, speed, color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const x = random(`x-${i}`) * width;
      const y = random(`y-${i}`) * height;
      const size = random(`s-${i}`) * 4 + 1;
      const speedFactor = random(`sp-${i}`) * 0.5 + 0.5;
      return { x, y, size, speedFactor, i };
    });
  }, [count, width, height]);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {particles.map((p) => {
        const yPos = (p.y - frame * speed * p.speedFactor) % height;
        const actualY = yPos < 0 ? yPos + height : yPos;
        return (
          <div key={p.i} style={{ position: 'absolute', left: p.x, top: actualY, width: p.size, height: p.size, borderRadius: '50%', backgroundColor: color, opacity: 0.6 }} />
        );
      })}
    </div>
  );
};
