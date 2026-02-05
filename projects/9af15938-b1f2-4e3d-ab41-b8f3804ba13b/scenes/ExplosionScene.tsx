import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BlackBackground } from '../components/Backgrounds';

const NUM_BARS = 80;

export const ExplosionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = ['#E50914', '#B20710', '#831010', '#5F1111', '#4B0D0D'];

  const renderBars = () => {
    return Array.from({ length: NUM_BARS }).map((_, i) => {
      const delay = i * 0.5;
      
      const barHeight = spring({
        frame: frame - delay,
        fps,
        from: 0,
        to: height * 0.8,
        config: {
          damping: 200,
          stiffness: 250,
        },
      });

      // Animation fades out at the end
      const opacity = interpolate(frame, [50, 60], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

      // Create a curved path for the bars
      const xOffset = (i - NUM_BARS / 2) * 20;
      const curve = Math.sin((i / NUM_BARS) * Math.PI) * 200;
      
      const barStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: height / 2 - (height * 0.8) / 2,
        left: width / 2 + xOffset,
        width: 15,
        height: barHeight,
        backgroundColor: colors[i % colors.length],
        opacity,
        transform: `translate(-50%, -${curve}px)`,
        boxShadow: `0 0 25px ${colors[i % colors.length]}`,
      };

      return <div key={i} style={barStyle} />;
    });
  };

  return (
    <AbsoluteFill>
      <BlackBackground />
      <AbsoluteFill style={{ 
        filter: 'blur(5px)', // Add a blur for a softer, more cinematic look
        }}>
        {renderBars()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
