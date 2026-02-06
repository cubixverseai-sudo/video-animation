import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, staticFile } from 'remotion';

export const RingReveal: React.FC = () => {
  const frame = useCurrentFrame();
  
  const scale = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const rotation = interpolate(frame, [0, 75], [0, 15]);

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
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          opacity: opacity,
          filter: 'drop-shadow(0 0 20px rgba(255, 105, 180, 0.7))',
          clipPath: 'circle(50% at 50% 50%)' // Hides the text
        }}
      />
    </AbsoluteFill>
  );
};
