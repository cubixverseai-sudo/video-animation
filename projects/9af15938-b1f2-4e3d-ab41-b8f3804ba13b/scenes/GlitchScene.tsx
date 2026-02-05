import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { BlackBackground } from '../components/Backgrounds';

export const GlitchScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  // The line appears and holds
  const opacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glitch effect towards the end of the scene
  const glitchAmount = interpolate(frame, [25, 30], [0, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glitchY = (random(`y-${frame}`) - 0.5) * glitchAmount;
  const glitchOpacity = random(`o-${frame}`) > 0.3 ? 1 : 0;

  return (
    <AbsoluteFill>
      <BlackBackground />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: '10px',
            height: '250px',
            backgroundColor: '#E50914',
            opacity: frame >= 25 ? glitchOpacity : opacity,
            transform: `translateY(${glitchY}px)`,
            boxShadow: '0 0 20px #E50914',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
