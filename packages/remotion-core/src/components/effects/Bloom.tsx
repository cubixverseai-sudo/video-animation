/**
 * 💫 BLOOM / GLOW EFFECTS
 * Add ethereal glow to bright elements
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export interface BloomProps {
  children: React.ReactNode;
  /** Bloom intensity (0-1) */
  intensity?: number;
  /** Blur radius for glow */
  radius?: number;
  /** Threshold - only bloom bright areas */
  threshold?: number;
  /** Glow color tint */
  tint?: string;
  /** Animate bloom */
  animated?: boolean;
  /** Animation range [min, max] */
  animationRange?: [number, number];
  /** Animation speed (frames per cycle) */
  animationSpeed?: number;
}

export const Bloom: React.FC<BloomProps> = ({
  children,
  intensity = 0.5,
  radius = 20,
  threshold = 0.8,
  tint,
  animated = false,
  animationRange = [0.3, 0.7],
  animationSpeed = 90,
}) => {
  const frame = useCurrentFrame();
  
  // Animated intensity (breathing effect)
  const currentIntensity = animated
    ? interpolate(
        Math.sin((frame / animationSpeed) * Math.PI * 2),
        [-1, 1],
        animationRange,
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : intensity;
  
  return (
    <AbsoluteFill>
      {/* Bloom layer (blurred duplicate) */}
      <AbsoluteFill
        style={{
          filter: `blur(${radius}px) brightness(1.2)`,
          opacity: currentIntensity,
          mixBlendMode: 'screen',
          ...(tint && {
            backgroundColor: tint,
            mixBlendMode: 'overlay',
          }),
        }}
      >
        {children}
      </AbsoluteFill>
      
      {/* Second bloom layer for extra glow */}
      <AbsoluteFill
        style={{
          filter: `blur(${radius * 2}px) brightness(1.1)`,
          opacity: currentIntensity * 0.5,
          mixBlendMode: 'screen',
        }}
      >
        {children}
      </AbsoluteFill>
      
      {/* Original content */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// GLOW WRAPPER (Simple glow for elements)
// ═══════════════════════════════════════════════════════════════

export interface GlowWrapperProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  size?: number;
  animated?: boolean;
}

export const GlowWrapper: React.FC<GlowWrapperProps> = ({
  children,
  color = '#6366f1',
  intensity = 1,
  size = 30,
  animated = false,
}) => {
  const frame = useCurrentFrame();
  
  const pulseIntensity = animated
    ? intensity * (0.7 + Math.sin(frame * 0.1) * 0.3)
    : intensity;
  
  return (
    <div
      style={{
        position: 'relative',
        filter: `drop-shadow(0 0 ${size * pulseIntensity}px ${color})`,
      }}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NEON GLOW (Intense neon sign effect)
// ═══════════════════════════════════════════════════════════════

export interface NeonGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  flicker?: boolean;
  flickerSpeed?: number;
}

export const NeonGlow: React.FC<NeonGlowProps> = ({
  children,
  color = '#ff00ff',
  intensity = 1,
  flicker = true,
  flickerSpeed = 0.2,
}) => {
  const frame = useCurrentFrame();
  
  // Neon flicker effect
  let flickerIntensity = intensity;
  if (flicker) {
    const noise = Math.sin(frame * flickerSpeed) * Math.sin(frame * flickerSpeed * 1.3);
    flickerIntensity = intensity * (0.85 + noise * 0.15);
  }
  
  return (
    <div
      style={{
        position: 'relative',
        textShadow: `
          0 0 5px #fff,
          0 0 10px #fff,
          0 0 20px ${color},
          0 0 40px ${color},
          0 0 80px ${color}
        `,
        opacity: flickerIntensity,
      }}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCANLINES (CRT/Retro effect)
// ═══════════════════════════════════════════════════════════════

export interface ScanlinesProps {
  /** Line spacing in pixels */
  spacing?: number;
  /** Line opacity */
  opacity?: number;
  /** Animate scanlines */
  animated?: boolean;
  /** Animation speed */
  speed?: number;
  /** Line color */
  color?: string;
}

export const Scanlines: React.FC<ScanlinesProps> = ({
  spacing = 4,
  opacity = 0.1,
  animated = true,
  speed = 1,
  color = '#000000',
}) => {
  const frame = useCurrentFrame();
  
  const offset = animated ? (frame * speed) % spacing : 0;
  
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${spacing - 1}px,
          ${color} ${spacing - 1}px,
          ${color} ${spacing}px
        )`,
        backgroundPosition: `0 ${offset}px`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Bloom;
