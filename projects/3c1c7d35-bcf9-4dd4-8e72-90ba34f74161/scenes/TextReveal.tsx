import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, staticFile } from 'remotion';

export const TextReveal: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, 30], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const imageURL = staticFile('assets/3c1c7d35-bcf9-4dd4-8e72-90ba34f74161/images/Logo-Animation.jpeg');

  return (
    <AbsoluteFill style={{ display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: 'transparent'
    }}>
      <div
        style={{ width: '80%',
          height: '80%',
          backgroundImage: `url(${imageURL})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity,
          transform: `translateY(${translateY}px)`,
          clipPath: 'inset(40% 0% 40% 0%)', // Reveals only the text
          filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))'
        }}
      />
    </AbsoluteFill>
  );
};
