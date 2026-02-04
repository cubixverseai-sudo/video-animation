/**
 * 🔲 VIGNETTE
 * Cinematic edge darkening effect
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export interface VignetteProps {
  /** Vignette intensity (0-1) */
  intensity?: number;
  /** Size of the clear center area (0-1) */
  size?: number;
  /** Softness of the gradient edge */
  softness?: number;
  /** Vignette color */
  color?: string;
  /** Shape: circular or oval */
  shape?: 'circle' | 'ellipse';
  /** Aspect ratio for ellipse (width/height) */
  aspect?: number;
  /** Animate intensity */
  animated?: boolean;
  /** Animation range [min, max] */
  animationRange?: [number, number];
  /** Animation speed (frames per cycle) */
  animationSpeed?: number;
}

export const Vignette: React.FC<VignetteProps> = ({
  intensity = 0.5,
  size = 0.5,
  softness = 0.5,
  color = '#000000',
  shape = 'ellipse',
  aspect = 1.5,
  animated = false,
  animationRange = [0.4, 0.6],
  animationSpeed = 120,
}) => {
  const frame = useCurrentFrame();
  
  // Animated intensity (subtle breathing effect)
  const currentIntensity = animated
    ? interpolate(
        Math.sin((frame / animationSpeed) * Math.PI * 2),
        [-1, 1],
        animationRange,
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : intensity;
  
  // Calculate gradient stops
  const innerStop = Math.round(size * 100);
  const outerStop = Math.round((size + softness) * 100);
  
  const gradient = shape === 'circle'
    ? `radial-gradient(circle, transparent ${innerStop}%, ${color} ${outerStop}%)`
    : `radial-gradient(ellipse ${100 * aspect}% 100%, transparent ${innerStop}%, ${color} ${outerStop}%)`;
  
  return (
    <AbsoluteFill
      style={{
        background: gradient,
        opacity: currentIntensity,
        pointerEvents: 'none',
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// CORNER VIGNETTE (Only darkens corners)
// ═══════════════════════════════════════════════════════════════

export interface CornerVignetteProps {
  intensity?: number;
  size?: number;
  color?: string;
}

export const CornerVignette: React.FC<CornerVignetteProps> = ({
  intensity = 0.4,
  size = 40,
  color = '#000000',
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Top-left */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${size}%`,
          height: `${size}%`,
          background: `radial-gradient(ellipse at 0% 0%, ${color}, transparent 70%)`,
          opacity: intensity,
        }}
      />
      {/* Top-right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: `${size}%`,
          height: `${size}%`,
          background: `radial-gradient(ellipse at 100% 0%, ${color}, transparent 70%)`,
          opacity: intensity,
        }}
      />
      {/* Bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${size}%`,
          height: `${size}%`,
          background: `radial-gradient(ellipse at 0% 100%, ${color}, transparent 70%)`,
          opacity: intensity,
        }}
      />
      {/* Bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: `${size}%`,
          height: `${size}%`,
          background: `radial-gradient(ellipse at 100% 100%, ${color}, transparent 70%)`,
          opacity: intensity,
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// LETTERBOX (Cinematic black bars)
// ═══════════════════════════════════════════════════════════════

export interface LetterboxProps {
  /** Target aspect ratio (e.g., 2.39 for cinematic) */
  aspectRatio?: number;
  /** Bar color */
  color?: string;
  /** Animate bars in */
  animated?: boolean;
  /** Animation delay in frames */
  delay?: number;
  /** Animation duration in frames */
  duration?: number;
}

export const Letterbox: React.FC<LetterboxProps> = ({
  aspectRatio = 2.39,
  color = '#000000',
  animated = false,
  delay = 0,
  duration = 30,
}) => {
  const frame = useCurrentFrame();
  
  // Calculate bar height based on aspect ratio
  // For 16:9 (1.78) to 2.39:1, bars are about 6.4% of height each
  const barHeight = Math.max(0, ((1 / 1.78) - (1 / aspectRatio)) / (1 / 1.78) * 50);
  
  // Animation progress
  const progress = animated
    ? interpolate(
        frame - delay,
        [0, duration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;
  
  const currentBarHeight = barHeight * progress;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${currentBarHeight}%`,
          backgroundColor: color,
        }}
      />
      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${currentBarHeight}%`,
          backgroundColor: color,
        }}
      />
    </AbsoluteFill>
  );
};

export default Vignette;
