/**
 * ✨ PARTICLE FIELD
 * Ambient particle system for backgrounds
 */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

export type ParticlePreset = 
  | 'stars'
  | 'dust'
  | 'snow'
  | 'rain'
  | 'fireflies'
  | 'bubbles'
  | 'confetti'
  | 'sparks'
  | 'embers'
  | 'bokeh'
  | 'tech'
  | 'cyber'
  | 'matrix';

export interface ParticleFieldProps {
  /** Particle preset or custom */
  preset?: ParticlePreset;
  /** Number of particles */
  count?: number;
  /** Particle colors */
  colors?: string[];
  /** Particle size range [min, max] */
  sizeRange?: [number, number];
  /** Movement speed */
  speed?: number;
  /** Movement direction in degrees (0 = right, 90 = down) */
  direction?: number;
  /** Add random drift */
  drift?: boolean;
  /** Drift amount */
  driftAmount?: number;
  /** Particle opacity range [min, max] */
  opacityRange?: [number, number];
  /** Enable particle glow */
  glow?: boolean;
  /** Glow intensity */
  glowIntensity?: number;
  /** Particle shape */
  shape?: 'circle' | 'square' | 'star' | 'line';
  /** Enable parallax (different speeds based on size) */
  parallax?: boolean;
  /** Parallax intensity */
  parallaxIntensity?: number;
  /** Seed for deterministic randomness */
  seed?: string;
}

const PRESETS: Record<ParticlePreset, Partial<ParticleFieldProps>> = {
  stars: {
    colors: ['#ffffff', '#ffffee', '#eeeeff'],
    sizeRange: [1, 3],
    speed: 0,
    opacityRange: [0.3, 1],
    glow: true,
    glowIntensity: 0.5,
    shape: 'circle',
  },
  dust: {
    colors: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)'],
    sizeRange: [1, 4],
    speed: 0.2,
    direction: 90,
    drift: true,
    driftAmount: 0.5,
    opacityRange: [0.2, 0.5],
    shape: 'circle',
  },
  snow: {
    colors: ['#ffffff', '#f0f8ff', '#e6e6fa'],
    sizeRange: [2, 8],
    speed: 1,
    direction: 100,
    drift: true,
    driftAmount: 2,
    opacityRange: [0.5, 1],
    shape: 'circle',
  },
  rain: {
    colors: ['rgba(150,200,255,0.6)'],
    sizeRange: [1, 2],
    speed: 8,
    direction: 95,
    opacityRange: [0.3, 0.7],
    shape: 'line',
  },
  fireflies: {
    colors: ['#ffff00', '#00ff00', '#ffcc00'],
    sizeRange: [2, 5],
    speed: 0.3,
    drift: true,
    driftAmount: 3,
    opacityRange: [0.3, 1],
    glow: true,
    glowIntensity: 1.5,
    shape: 'circle',
  },
  bubbles: {
    colors: ['rgba(100,200,255,0.3)', 'rgba(150,220,255,0.4)'],
    sizeRange: [5, 20],
    speed: 0.5,
    direction: 270,
    drift: true,
    driftAmount: 1,
    opacityRange: [0.2, 0.5],
    shape: 'circle',
  },
  confetti: {
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'],
    sizeRange: [4, 10],
    speed: 2,
    direction: 90,
    drift: true,
    driftAmount: 3,
    opacityRange: [0.8, 1],
    shape: 'square',
  },
  sparks: {
    colors: ['#ffd700', '#ffa500', '#ff4500', '#ffff00'],
    sizeRange: [1, 4],
    speed: 3,
    direction: 270,
    opacityRange: [0.6, 1],
    glow: true,
    glowIntensity: 1,
    shape: 'circle',
  },
  embers: {
    colors: ['#ff4500', '#ff6600', '#ff8800', '#ffaa00'],
    sizeRange: [2, 6],
    speed: 0.8,
    direction: 260,
    drift: true,
    driftAmount: 2,
    opacityRange: [0.5, 1],
    glow: true,
    glowIntensity: 1.2,
    shape: 'circle',
  },
  bokeh: {
    colors: ['rgba(99,102,241,0.3)', 'rgba(139,92,246,0.3)', 'rgba(236,72,153,0.3)'],
    sizeRange: [20, 80],
    speed: 0.1,
    drift: true,
    driftAmount: 0.5,
    opacityRange: [0.1, 0.3],
    shape: 'circle',
    parallax: true,
    parallaxIntensity: 0.5,
  },
  tech: {
    colors: ['#00f3ff', '#6366f1', '#8b5cf6', '#00ff88'],
    sizeRange: [1, 4],
    speed: 0.3,
    drift: true,
    driftAmount: 1,
    opacityRange: [0.4, 0.9],
    glow: true,
    glowIntensity: 1.2,
    shape: 'circle',
  },
  cyber: {
    colors: ['#ff00ff', '#00ffff', '#ffff00'],
    sizeRange: [1, 3],
    speed: 0.5,
    drift: true,
    driftAmount: 2,
    opacityRange: [0.5, 1],
    glow: true,
    glowIntensity: 1.5,
    shape: 'circle',
  },
  matrix: {
    colors: ['#00ff00', '#00cc00', '#009900'],
    sizeRange: [2, 4],
    speed: 2,
    direction: 90,
    opacityRange: [0.3, 0.8],
    glow: true,
    glowIntensity: 0.8,
    shape: 'line',
  },
};

export const ParticleField: React.FC<ParticleFieldProps> = ({
  preset = 'dust',
  count = 50,
  colors: customColors,
  sizeRange: customSizeRange,
  speed: customSpeed,
  direction: customDirection,
  drift: customDrift,
  driftAmount: customDriftAmount,
  opacityRange: customOpacityRange,
  glow: customGlow,
  glowIntensity: customGlowIntensity,
  shape: customShape,
  parallax: customParallax,
  parallaxIntensity: customParallaxIntensity,
  seed = 'particles',
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Merge preset with custom props
  const presetConfig = PRESETS[preset] || {};
  const colors = customColors || presetConfig.colors || ['#ffffff'];
  const sizeRange = customSizeRange || presetConfig.sizeRange || [2, 6];
  const speed = customSpeed ?? presetConfig.speed ?? 1;
  const direction = customDirection ?? presetConfig.direction ?? 90;
  const drift = customDrift ?? presetConfig.drift ?? false;
  const driftAmount = customDriftAmount ?? presetConfig.driftAmount ?? 1;
  const opacityRange = customOpacityRange || presetConfig.opacityRange || [0.5, 1];
  const glow = customGlow ?? presetConfig.glow ?? false;
  const glowIntensity = customGlowIntensity ?? presetConfig.glowIntensity ?? 1;
  const shape = customShape ?? presetConfig.shape ?? 'circle';
  const parallax = customParallax ?? presetConfig.parallax ?? false;
  const parallaxIntensity = customParallaxIntensity ?? presetConfig.parallaxIntensity ?? 0.5;
  
  // Generate particles
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = sizeRange[0] + random(`${seed}-size-${i}`) * (sizeRange[1] - sizeRange[0]);
      const parallaxFactor = parallax ? 0.5 + (size / sizeRange[1]) * parallaxIntensity : 1;
      
      return {
        id: i,
        x: random(`${seed}-x-${i}`) * 120 - 10, // % position with overflow
        y: random(`${seed}-y-${i}`) * 120 - 10,
        size,
        color: colors[Math.floor(random(`${seed}-color-${i}`) * colors.length)],
        opacity: opacityRange[0] + random(`${seed}-opacity-${i}`) * (opacityRange[1] - opacityRange[0]),
        phase: random(`${seed}-phase-${i}`) * Math.PI * 2,
        parallaxFactor,
        rotation: random(`${seed}-rot-${i}`) * 360,
      };
    });
  }, [count, sizeRange, colors, opacityRange, seed, parallax, parallaxIntensity]);
  
  // Movement direction in radians
  const dirRad = (direction * Math.PI) / 180;
  const moveX = Math.cos(dirRad);
  const moveY = Math.sin(dirRad);
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p) => {
        // Calculate position with movement and drift
        const movement = frame * speed * p.parallaxFactor;
        const driftOffset = drift
          ? Math.sin(frame * 0.05 + p.phase) * driftAmount
          : 0;
        
        let currentX = p.x + (movement * moveX) + driftOffset;
        let currentY = p.y + (movement * moveY);
        
        // Wrap particles around
        currentX = ((currentX % 120) + 120) % 120;
        currentY = ((currentY % 120) + 120) % 120;
        
        // Opacity flicker for fireflies/stars
        const flickerOpacity = preset === 'fireflies' || preset === 'stars'
          ? p.opacity * (0.5 + Math.sin(frame * 0.2 + p.phase) * 0.5)
          : p.opacity;
        
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${currentX}%`,
          top: `${currentY}%`,
          width: shape === 'line' ? 1 : p.size,
          height: shape === 'line' ? p.size * 10 : p.size,
          backgroundColor: p.color,
          borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '0',
          opacity: flickerOpacity,
          transform: shape === 'square' ? `rotate(${p.rotation + frame}deg)` : undefined,
          boxShadow: glow
            ? `0 0 ${p.size * glowIntensity}px ${p.color}, 0 0 ${p.size * glowIntensity * 2}px ${p.color}`
            : undefined,
        };
        
        return <div key={p.id} style={style} />;
      })}
    </AbsoluteFill>
  );
};

export default ParticleField;
