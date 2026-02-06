import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, staticFile } from 'remotion';

export const LogoHold: React.FC = () => {
  const frame = useCurrentFrame();

  const taglineOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const imageURL = staticFile('assets/3c1c7d35-bcf9-4dd4-8e72-90ba34f74161/images/Logo-Animation.jpeg');

  return (
    <AbsoluteFill style={{ display: 'flex', 
      flexDirection: 'column',
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
          filter: 'drop-shadow(0 0 20px rgba(255, 105, 180, 0.7))'
        }}
      />
      <div style={{ fontSize: '48px',
        color: 'white',
        opacity: taglineOpacity,
        marginTop: '-150px', // Adjust position to be closer to the logo
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        AI Video Creation Platform
      </div>
    </AbsoluteFill>
  );
};
