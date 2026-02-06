import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, random } from 'remotion';

const particleCount = 200;

const Particle: React.FC<{ index: number }> = ({ index }) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const seed = `particle-${index}`;
  const life = random(seed + 'life') * 120 + 30;
  const startFrame = random(seed + 'start') * -30;

  if (frame > startFrame + life || frame < startFrame) {
    return null;
  }

  const x = random(seed + 'x') * width;
  const y = random(seed + 'y') * height;
  const speed = random(seed + 'speed') * 0.5 + 0.2;
  const angle = random(seed + 'angle') * Math.PI * 2;

  const currentX = x + Math.cos(angle) * (frame - startFrame) * speed;
  const currentY = y + Math.sin(angle) * (frame - startFrame) * speed;
  const opacity = Math.sin(((frame - startFrame) / life) * Math.PI);
  const size = random(seed + 'size') * 4 + 1;
  const color = ['#FF69B4', '#FFA500', '#DA70D6'][Math.floor(random(seed + 'color') * 3)];

  return (
    <div
      style={{ position: 'absolute',
        left: currentX,
        top: currentY,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        opacity,
      }}
    />
  );
};

export const IntroParticles: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#12001A' }}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </AbsoluteFill>
  );
};
