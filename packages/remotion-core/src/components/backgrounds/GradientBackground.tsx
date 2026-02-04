/**
 * 🌈 GRADIENT BACKGROUND
 * Animated gradient backgrounds with multiple styles
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { GRADIENTS, PALETTES } from '../utils/colors';

export type GradientType = 
  | 'linear'
  | 'radial'
  | 'conic'
  | 'mesh'
  | 'aurora'
  | 'wave';

export interface GradientBackgroundProps {
  /** Gradient type */
  type?: GradientType;
  /** Gradient colors */
  colors?: string[];
  /** Color preset */
  preset?: keyof typeof PALETTES;
  /** Gradient angle (for linear) */
  angle?: number;
  /** Animate gradient */
  animated?: boolean;
  /** Animation speed */
  animationSpeed?: number;
  /** Animation type */
  animationType?: 'rotate' | 'shift' | 'morph';
  /** Position X (for radial) */
  positionX?: number;
  /** Position Y (for radial) */
  positionY?: number;
  /** Additional overlay */
  overlay?: 'noise' | 'grid' | 'none';
  /** Overlay opacity */
  overlayOpacity?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  type = 'linear',
  colors: customColors,
  preset,
  angle = 135,
  animated = false,
  animationSpeed = 1,
  animationType = 'rotate',
  positionX = 50,
  positionY = 50,
  overlay = 'none',
  overlayOpacity = 0.1,
}) => {
  const frame = useCurrentFrame();
  
  // Get colors from preset or custom
  const colors = customColors || (preset 
    ? [PALETTES[preset].bg.primary, PALETTES[preset].bg.secondary, PALETTES[preset].accent.primary]
    : ['#0a0a0f', '#1a1025', '#0a0a0f']
  );
  
  // Animated angle
  let currentAngle = angle;
  let currentPosX = positionX;
  let currentPosY = positionY;
  
  if (animated) {
    switch (animationType) {
      case 'rotate':
        currentAngle = angle + frame * animationSpeed;
        break;
      case 'shift':
        currentPosX = positionX + Math.sin(frame * 0.02 * animationSpeed) * 20;
        currentPosY = positionY + Math.cos(frame * 0.015 * animationSpeed) * 15;
        break;
      case 'morph':
        // Colors shift over time (handled in gradient generation)
        break;
    }
  }
  
  // Generate gradient based on type
  let gradient: string;
  
  switch (type) {
    case 'linear':
      gradient = `linear-gradient(${currentAngle}deg, ${colors.join(', ')})`;
      break;
    
    case 'radial':
      gradient = `radial-gradient(ellipse at ${currentPosX}% ${currentPosY}%, ${colors.join(', ')})`;
      break;
    
    case 'conic':
      gradient = `conic-gradient(from ${currentAngle}deg at ${currentPosX}% ${currentPosY}%, ${colors.join(', ')}, ${colors[0]})`;
      break;
    
    case 'mesh':
      // Multiple overlapping radial gradients
      const meshPositions = [
        { x: 20, y: 20 },
        { x: 80, y: 30 },
        { x: 50, y: 80 },
        { x: 30, y: 60 },
      ];
      gradient = meshPositions.map((pos, i) => {
        const offsetX = animated ? Math.sin(frame * 0.01 + i) * 10 : 0;
        const offsetY = animated ? Math.cos(frame * 0.01 + i * 1.5) * 10 : 0;
        const color = colors[i % colors.length];
        return `radial-gradient(ellipse 50% 50% at ${pos.x + offsetX}% ${pos.y + offsetY}%, ${color}, transparent 70%)`;
      }).join(', ');
      break;
    
    case 'aurora':
      // Northern lights effect
      const auroraShift = animated ? frame * animationSpeed * 0.5 : 0;
      gradient = `
        linear-gradient(180deg, 
          ${colors[0]} 0%,
          transparent 30%
        ),
        radial-gradient(ellipse 100% 50% at ${50 + Math.sin(auroraShift * 0.01) * 20}% 0%, 
          ${colors[1]}40, transparent 50%
        ),
        radial-gradient(ellipse 80% 40% at ${70 + Math.cos(auroraShift * 0.015) * 15}% 10%, 
          ${colors[2] || colors[1]}30, transparent 50%
        ),
        linear-gradient(180deg, transparent 60%, ${colors[0]} 100%)
      `;
      break;
    
    case 'wave':
      // Wave-like animated gradient
      const waveOffset = animated ? frame * animationSpeed * 2 : 0;
      const waveY = 50 + Math.sin(waveOffset * 0.02) * 20;
      gradient = `
        linear-gradient(180deg,
          ${colors[0]} 0%,
          ${colors[1] || colors[0]} ${waveY - 10}%,
          ${colors[2] || colors[1] || colors[0]} ${waveY + 10}%,
          ${colors[0]} 100%
        )
      `;
      break;
    
    default:
      gradient = `linear-gradient(${currentAngle}deg, ${colors.join(', ')})`;
  }
  
  // Overlay patterns
  let overlayStyle: React.CSSProperties = {};
  
  if (overlay === 'noise') {
    overlayStyle = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      opacity: overlayOpacity,
      mixBlendMode: 'overlay' as const,
    };
  } else if (overlay === 'grid') {
    overlayStyle = {
      backgroundImage: `
        linear-gradient(rgba(255,255,255,${overlayOpacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,${overlayOpacity}) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    };
  }
  
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: gradient }} />
      {overlay !== 'none' && <AbsoluteFill style={overlayStyle} />}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// ANIMATED BLOBS (Lava lamp style)
// ═══════════════════════════════════════════════════════════════

export interface BlobBackgroundProps {
  colors?: string[];
  blobCount?: number;
  speed?: number;
  blur?: number;
  opacity?: number;
  backgroundColor?: string;
}

export const BlobBackground: React.FC<BlobBackgroundProps> = ({
  colors = ['#6366f1', '#8b5cf6', '#ec4899'],
  blobCount = 3,
  speed = 1,
  blur = 100,
  opacity = 0.6,
  backgroundColor = '#030303',
}) => {
  const frame = useCurrentFrame();
  
  const blobs = Array.from({ length: blobCount }, (_, i) => {
    const baseX = 30 + (i * 20);
    const baseY = 30 + (i * 15);
    const x = baseX + Math.sin(frame * 0.01 * speed + i * 2) * 20;
    const y = baseY + Math.cos(frame * 0.015 * speed + i * 1.5) * 15;
    const scale = 1 + Math.sin(frame * 0.02 * speed + i) * 0.2;
    
    return {
      x,
      y,
      scale,
      color: colors[i % colors.length],
    };
  });
  
  return (
    <AbsoluteFill style={{ backgroundColor, overflow: 'hidden' }}>
      <div style={{ filter: `blur(${blur}px)`, width: '100%', height: '100%' }}>
        {blobs.map((blob, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${blob.x}%`,
              top: `${blob.y}%`,
              width: '40%',
              height: '40%',
              borderRadius: '50%',
              backgroundColor: blob.color,
              opacity,
              transform: `translate(-50%, -50%) scale(${blob.scale})`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default GradientBackground;
