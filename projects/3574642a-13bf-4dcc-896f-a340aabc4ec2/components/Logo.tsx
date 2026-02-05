import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const N_COLOR = '#E50914';
const N_SHADOW_COLOR = '#B20710';
const N_WIDTH = 200;
const N_HEIGHT = 500;
const N_BEZEL = 30; // The angled cut at top and bottom

// A single animated stroke of the N logo
const AnimatedStroke: React.FC<{
  position: 'left' | 'middle' | 'right';
  delay: number;
}> = ({ position, delay }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const animation = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 100,
      stiffness: 150,
      mass: 1.5,
    },
    durationInFrames: 90,
  });

  const path = {
    left: `polygon(0% 0%, 100% ${N_BEZEL}px, 100% 100%, 0% calc(100% - ${N_BEZEL}px))`,
    middle: `polygon(${N_BEZEL}px 0%, calc(100% - ${N_BEZEL}px) 100%, 100% 100%, 0% 0%)`,
    right: `polygon(0% ${N_BEZEL}px, 100% 0%, 100% calc(100% - ${N_BEZEL}px), 0% 100%)`,
  };

  const getStrokeStyles = (): React.CSSProperties => {
    switch (position) {
      case 'left':
        return {
          height: N_HEIGHT,
          width: N_WIDTH,
          left: -N_WIDTH * 1.1,
          clipPath: path.left,
          transform: `translateY(${(1 - animation) * -100}px)`,
        };
      case 'middle':
        return {
          height: N_HEIGHT * 1.1,
          width: N_WIDTH,
          left: 0,
          top: -N_HEIGHT * 0.05,
          transformOrigin: 'center center',
          transform: `skewX(-21deg) scale(${animation})`,
          clipPath: 'none', // Middle stroke is a skewed div, not clipped
        };
      case 'right':
        return {
          height: N_HEIGHT,
          width: N_WIDTH,
          right: -N_WIDTH * 1.1,
          clipPath: path.right,
          transform: `translateY(${(1 - animation) * 100}px)`,
        };
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: N_COLOR,
        opacity: animation,
        ...getStrokeStyles(),
      }}
    />
  );
};

// The main logo component orchestrating the strokes
export const NetflixLogo: React.FC = () => {
    const frame = useCurrentFrame();
    
    // Animate a glow effect after the logo has formed
    const glowIntensity = spring({
        frame: frame - 110, // Start glow after main animation
        fps: useVideoConfig().fps,
        config: { damping: 200, stiffness: 100 },
        durationInFrames: 60,
    });
    
    const textShadow = `
        0 0 ${glowIntensity * 15}px ${N_COLOR},
        0 0 ${glowIntensity * 30}px ${N_COLOR},
        0 0 ${glowIntensity * 50}px ${N_SHADOW_COLOR}
    `;

    // A subtle 3D depth effect on the logo
    const depth = interpolate(frame, [80, 120], [0, 10], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });
    
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: N_WIDTH,
        height: N_HEIGHT,
        filter: `drop-shadow(0 0 ${glowIntensity * 20}px ${N_SHADOW_COLOR})`,
    }

    const strokeContainerStyle: React.CSSProperties = {
        position: 'absolute',
        width: N_WIDTH,
        height: N_HEIGHT,
        transform: `translateX(-${depth/2}px)`,
        boxShadow: `${depth}px 0 0 ${N_SHADOW_COLOR}`,
        borderRadius: '5px'
    }

    return (
        <div style={containerStyle}>
            <div style={strokeContainerStyle}>
                <AnimatedStroke position="left" delay={60} />
                <AnimatedStroke position="middle" delay={75} />
                <AnimatedStroke position="right" delay={60} />
            </div>
        </div>
    );
};
