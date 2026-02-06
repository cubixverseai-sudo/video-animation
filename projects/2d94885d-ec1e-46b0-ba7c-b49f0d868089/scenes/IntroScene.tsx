import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ParticleField } from '../components/ParticleField';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textY = spring({
    frame,
    fps,
    config: { damping: 200 },
    from: 50,
    to: 0
  });

  const fadeOut = interpolate(frame, [50, 70], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ParticleField count={50} speed={2} color="#8a2be2" />
      
      <div style={{ opacity: opacity * fadeOut,
        transform: `translateY(${textY}px)`,
        textAlign: 'center',
        zIndex: 10
      }}>
        <h1 style={{ fontFamily: 'sans-serif',
          color: '#fff',
          fontSize: 80,
          margin: 0,
          background: 'linear-gradient(to right, #ff00cc, #333399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(255,0,204,0.5))'
        }}>
          Create video
        </h1>
        <h2 style={{ fontFamily: 'sans-serif',
          color: '#fff',
          fontSize: 40,
          fontWeight: 300,
          marginTop: 20,
          letterSpacing: 4
        }}>
          WITH ARTIFICIAL INTELLIGENCE
        </h2>
      </div>
    </AbsoluteFill>
  );
};
