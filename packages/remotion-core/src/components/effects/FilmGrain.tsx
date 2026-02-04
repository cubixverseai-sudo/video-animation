/**
 * 🎞️ FILM GRAIN
 * Adds cinematic film grain texture overlay
 */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, random } from 'remotion';

export interface FilmGrainProps {
  /** Grain intensity (0-1) */
  intensity?: number;
  /** Grain size in pixels */
  size?: number;
  /** Animate grain (changes each frame) */
  animated?: boolean;
  /** Blend mode */
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  /** Monochrome or colored grain */
  monochrome?: boolean;
  /** Base color for monochrome grain */
  color?: string;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({
  intensity = 0.15,
  size = 1,
  animated = true,
  blendMode = 'overlay',
  monochrome = true,
  color = '#808080',
}) => {
  const frame = useCurrentFrame();
  
  // Change grain pattern based on frame for animation
  const seed = animated ? Math.floor(frame / 2) : 0;
  
  // Generate noise SVG
  const noiseSvg = useMemo(() => {
    const grainSize = Math.max(1, size);
    
    // Create SVG noise filter
    return `url("data:image/svg+xml,%3Csvg viewBox='0 0 ${200 * grainSize} ${200 * grainSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.8 / grainSize}' numOctaves='4' stitchTiles='stitch' seed='${seed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;
  }, [seed, size]);
  
  return (
    <AbsoluteFill
      style={{
        backgroundImage: noiseSvg,
        backgroundRepeat: 'repeat',
        opacity: intensity,
        mixBlendMode: blendMode,
        pointerEvents: 'none',
        // Add slight random offset for more organic feel
        transform: animated 
          ? `translate(${(random(`grain-x-${seed}`) - 0.5) * 10}px, ${(random(`grain-y-${seed}`) - 0.5) * 10}px)`
          : undefined,
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// FILM DUST & SCRATCHES
// ═══════════════════════════════════════════════════════════════

export interface FilmDustProps {
  /** Number of dust particles */
  particleCount?: number;
  /** Dust color */
  color?: string;
  /** Opacity */
  opacity?: number;
  /** Include scratches */
  scratches?: boolean;
  /** Scratch frequency (lower = more) */
  scratchFrequency?: number;
}

export const FilmDust: React.FC<FilmDustProps> = ({
  particleCount = 20,
  color = '#ffffff',
  opacity = 0.3,
  scratches = true,
  scratchFrequency = 30,
}) => {
  const frame = useCurrentFrame();
  
  // Generate dust particles
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      x: random(`dust-x-${i}`) * 100,
      y: random(`dust-y-${i}`) * 100,
      size: 1 + random(`dust-size-${i}`) * 3,
      opacity: 0.3 + random(`dust-opacity-${i}`) * 0.7,
      // Each particle has a lifespan
      startFrame: Math.floor(random(`dust-start-${i}`) * 60),
      duration: 3 + Math.floor(random(`dust-dur-${i}`) * 5),
    }));
  }, [particleCount]);
  
  // Check if we should show a scratch this frame
  const showScratch = scratches && frame % scratchFrequency < 3;
  const scratchX = showScratch ? random(`scratch-x-${Math.floor(frame / scratchFrequency)}`) * 100 : 0;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Dust particles */}
      {particles.map((particle, i) => {
        const particleFrame = (frame + particle.startFrame) % (particle.duration + 30);
        const isVisible = particleFrame < particle.duration;
        
        if (!isVisible) return null;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: opacity * particle.opacity,
            }}
          />
        );
      })}
      
      {/* Scratch line */}
      {showScratch && (
        <div
          style={{
            position: 'absolute',
            left: `${scratchX}%`,
            top: 0,
            width: 1,
            height: '100%',
            backgroundColor: color,
            opacity: opacity * 0.5,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default FilmGrain;
