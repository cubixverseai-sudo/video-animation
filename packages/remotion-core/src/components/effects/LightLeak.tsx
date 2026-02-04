/**
 * ✨ LIGHT LEAK
 * Cinematic light leak and flare effects
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random, spring, useVideoConfig } from 'remotion';
import { SPRING_PRESETS } from '../utils/springs';

export type LightLeakPreset = 
  | 'warm'
  | 'cool'
  | 'golden'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'rainbow'
  | 'sunset'
  | 'aurora';

export interface LightLeakProps {
  /** Preset color scheme */
  preset?: LightLeakPreset;
  /** Custom colors (overrides preset) */
  colors?: string[];
  /** Overall intensity (0-1) */
  intensity?: number;
  /** Position: percentage from left */
  positionX?: number;
  /** Position: percentage from top */
  positionY?: number;
  /** Size multiplier */
  size?: number;
  /** Blend mode */
  blendMode?: 'screen' | 'overlay' | 'soft-light' | 'color-dodge';
  /** Animate movement */
  animated?: boolean;
  /** Animation speed */
  animationSpeed?: number;
  /** Entrance animation */
  entrance?: boolean;
  /** Entrance delay */
  entranceDelay?: number;
  /** Duration (frames, undefined = infinite) */
  duration?: number;
}

const PRESETS: Record<LightLeakPreset, string[]> = {
  warm: ['rgba(255, 150, 50, 0.4)', 'rgba(255, 100, 50, 0.3)', 'rgba(255, 200, 100, 0.2)'],
  cool: ['rgba(100, 150, 255, 0.4)', 'rgba(50, 100, 255, 0.3)', 'rgba(150, 200, 255, 0.2)'],
  golden: ['rgba(255, 200, 50, 0.5)', 'rgba(255, 180, 0, 0.3)', 'rgba(255, 220, 100, 0.2)'],
  pink: ['rgba(255, 100, 150, 0.4)', 'rgba(255, 50, 100, 0.3)', 'rgba(255, 150, 200, 0.2)'],
  purple: ['rgba(139, 92, 246, 0.4)', 'rgba(124, 58, 237, 0.3)', 'rgba(167, 139, 250, 0.2)'],
  cyan: ['rgba(0, 255, 255, 0.4)', 'rgba(0, 200, 255, 0.3)', 'rgba(100, 255, 255, 0.2)'],
  rainbow: ['rgba(255, 0, 0, 0.3)', 'rgba(255, 200, 0, 0.3)', 'rgba(0, 255, 200, 0.3)'],
  sunset: ['rgba(255, 100, 50, 0.5)', 'rgba(255, 50, 100, 0.4)', 'rgba(255, 150, 0, 0.3)'],
  aurora: ['rgba(0, 255, 150, 0.4)', 'rgba(100, 0, 255, 0.3)', 'rgba(0, 200, 255, 0.3)'],
};

export const LightLeak: React.FC<LightLeakProps> = ({
  preset = 'warm',
  colors,
  intensity = 0.7,
  positionX = 30,
  positionY = 20,
  size = 1,
  blendMode = 'screen',
  animated = true,
  animationSpeed = 0.5,
  entrance = false,
  entranceDelay = 0,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const leakColors = colors || PRESETS[preset];
  
  // Animate position
  const animX = animated 
    ? positionX + Math.sin(frame * 0.02 * animationSpeed) * 10 
    : positionX;
  const animY = animated 
    ? positionY + Math.cos(frame * 0.015 * animationSpeed) * 8 
    : positionY;
  
  // Entrance animation
  let currentIntensity = intensity;
  if (entrance) {
    const entranceProgress = spring({
      frame: frame - entranceDelay,
      fps,
      config: SPRING_PRESETS.SMOOTH,
    });
    currentIntensity = intensity * entranceProgress;
  }
  
  // Duration/exit
  if (duration !== undefined) {
    const exitProgress = interpolate(
      frame - entranceDelay,
      [duration - 30, duration],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    currentIntensity = currentIntensity * exitProgress;
  }
  
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: blendMode,
        pointerEvents: 'none',
      }}
    >
      {leakColors.map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${animX + i * 15}%`,
            top: `${animY + i * 10}%`,
            width: `${80 * size}%`,
            height: `${80 * size}%`,
            background: `radial-gradient(ellipse at center, ${color}, transparent 60%)`,
            opacity: currentIntensity,
            transform: `rotate(${i * 30 + frame * 0.1}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// LENS FLARE
// ═══════════════════════════════════════════════════════════════

export interface LensFlareProps {
  /** Light source X position (0-100) */
  sourceX?: number;
  /** Light source Y position (0-100) */
  sourceY?: number;
  /** Flare color */
  color?: string;
  /** Intensity (0-1) */
  intensity?: number;
  /** Number of flare elements */
  elementCount?: number;
  /** Animate flare */
  animated?: boolean;
}

export const LensFlare: React.FC<LensFlareProps> = ({
  sourceX = 80,
  sourceY = 20,
  color = '#ffffff',
  intensity = 0.8,
  elementCount = 6,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  
  // Generate flare elements along the line from source through center
  const centerX = 50;
  const centerY = 50;
  const dx = centerX - sourceX;
  const dy = centerY - sourceY;
  
  const elements = Array.from({ length: elementCount }, (_, i) => {
    const t = 0.3 + (i / elementCount) * 1.4; // Position along line
    return {
      x: sourceX + dx * t,
      y: sourceY + dy * t,
      size: 20 + random(`flare-size-${i}`) * 60,
      opacity: (1 - i / elementCount) * 0.5,
      shape: i % 2 === 0 ? 'circle' : 'hexagon',
    };
  });
  
  // Animate intensity
  const animatedIntensity = animated
    ? intensity * (0.7 + Math.sin(frame * 0.05) * 0.3)
    : intensity;
  
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    >
      {/* Main light source glow */}
      <div
        style={{
          position: 'absolute',
          left: `${sourceX}%`,
          top: `${sourceY}%`,
          width: 200,
          height: 200,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${color}, transparent 50%)`,
          opacity: animatedIntensity,
        }}
      />
      
      {/* Flare elements */}
      {elements.map((el, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: el.size,
            height: el.size,
            transform: 'translate(-50%, -50%)',
            background: el.shape === 'circle'
              ? `radial-gradient(circle, ${color}, transparent 60%)`
              : `conic-gradient(from 0deg, ${color}, transparent, ${color}, transparent, ${color}, transparent)`,
            borderRadius: el.shape === 'circle' ? '50%' : '0',
            opacity: el.opacity * animatedIntensity,
          }}
        />
      ))}
      
      {/* Anamorphic streak */}
      <div
        style={{
          position: 'absolute',
          left: `${sourceX}%`,
          top: `${sourceY}%`,
          width: '200%',
          height: 4,
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: animatedIntensity * 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

export default LightLeak;
