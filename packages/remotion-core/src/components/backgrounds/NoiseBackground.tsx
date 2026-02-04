/**
 * 📺 NOISE BACKGROUND
 * Animated noise and static effects
 */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';

export type NoiseType = 
  | 'static'
  | 'perlin'
  | 'grain'
  | 'digital'
  | 'waves';

export interface NoiseBackgroundProps {
  /** Noise type */
  type?: NoiseType;
  /** Base color */
  color?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Noise intensity (0-1) */
  intensity?: number;
  /** Noise scale */
  scale?: number;
  /** Animation speed */
  speed?: number;
  /** Animated */
  animated?: boolean;
  /** Blend mode */
  blendMode?: 'normal' | 'overlay' | 'multiply' | 'screen';
}

export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
  type = 'static',
  color = '#1a1a1a',
  secondaryColor = '#2a2a2a',
  intensity = 0.5,
  scale = 1,
  speed = 1,
  animated = true,
  blendMode = 'normal',
}) => {
  const frame = useCurrentFrame();
  
  const seed = animated ? Math.floor(frame * speed) : 0;
  
  // Generate noise based on type
  const renderNoise = () => {
    switch (type) {
      case 'static':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 ${256 / scale} ${256 / scale}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.9 * scale}' numOctaves='4' seed='${seed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              opacity: intensity,
            }}
          />
        );
      
      case 'perlin':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='turbulence' baseFrequency='${0.02 * scale}' numOctaves='3' seed='${seed}'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
              opacity: intensity,
              backgroundColor: color,
              backgroundBlendMode: 'overlay',
            }}
          />
        );
      
      case 'grain':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: color,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' seed='${seed}'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
              backgroundBlendMode: 'overlay',
              opacity: intensity,
            }}
          />
        );
      
      case 'digital':
        // Digital noise with visible pixels
        return <DigitalNoise color={color} secondaryColor={secondaryColor} intensity={intensity} scale={scale} seed={seed} />;
      
      case 'waves':
        // Wave-like noise pattern
        const waveOffset = animated ? frame * speed * 2 : 0;
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `
                repeating-linear-gradient(
                  ${45 + Math.sin(waveOffset * 0.01) * 10}deg,
                  ${color},
                  ${color} 2px,
                  ${secondaryColor} 2px,
                  ${secondaryColor} 4px
                )
              `,
              opacity: intensity,
              transform: `translateY(${Math.sin(waveOffset * 0.02) * 5}px)`,
            }}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <AbsoluteFill style={{ mixBlendMode: blendMode }}>
      {renderNoise()}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// DIGITAL NOISE (Canvas-based for performance)
// ═══════════════════════════════════════════════════════════════

interface DigitalNoiseProps {
  color: string;
  secondaryColor: string;
  intensity: number;
  scale: number;
  seed: number;
}

const DigitalNoise: React.FC<DigitalNoiseProps> = ({
  color,
  secondaryColor,
  intensity,
  scale,
  seed,
}) => {
  const { width, height } = useVideoConfig();
  
  // Generate noise pattern using divs (canvas would be more performant but not supported in Remotion)
  const pixelSize = Math.max(4, Math.floor(8 / scale));
  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);
  
  const pixels = useMemo(() => {
    const result: boolean[][] = [];
    for (let y = 0; y < rows; y++) {
      result[y] = [];
      for (let x = 0; x < cols; x++) {
        result[y][x] = random(`digital-${seed}-${x}-${y}`) > 0.5;
      }
    }
    return result;
  }, [seed, rows, cols]);
  
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
        opacity: intensity,
      }}
    >
      {pixels.flat().map((isLight, i) => (
        <div
          key={i}
          style={{
            backgroundColor: isLight ? secondaryColor : color,
            width: pixelSize,
            height: pixelSize,
          }}
        />
      ))}
    </div>
  );
};

export default NoiseBackground;
