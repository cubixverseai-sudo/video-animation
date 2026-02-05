import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import { useVideoConfig } from 'remotion';

interface LogoTextProps {
  text: string;
}

export const LogoText: React.FC<LogoTextProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame,
    fps,
    from: 0.95,
    to: 1,
    config: {
      damping: 200,
    },
  });

  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: '160px',
        fontWeight: 'bold',
        letterSpacing: '-5px',
        color: '#E50914',
        opacity,
        transform: `scale(${scale})`,
        textShadow: '0 0 30px rgba(0,0,0,0.5)',
      }}
    >
      {text}
    </div>
  );
};
