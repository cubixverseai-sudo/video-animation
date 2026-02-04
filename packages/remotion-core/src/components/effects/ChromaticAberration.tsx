/**
 * 🌈 CHROMATIC ABERRATION
 * RGB split effect for that premium lens distortion look
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';

export interface ChromaticAberrationProps {
  children: React.ReactNode;
  
  /** Offset amount in pixels */
  offset?: number;
  /** Direction of split in degrees (0 = horizontal) */
  angle?: number;
  /** Only apply to edges */
  edgeOnly?: boolean;
  /** Edge falloff size */
  edgeFalloff?: number;
  
  /** Animate the effect */
  animated?: boolean;
  /** Animation type */
  animationType?: 'pulse' | 'glitch' | 'breathe';
  /** Animation speed */
  animationSpeed?: number;
  
  /** Entrance animation */
  entrance?: boolean;
  /** Entrance delay */
  entranceDelay?: number;
  /** Exit at frame */
  exitAt?: number;
}

export const ChromaticAberration: React.FC<ChromaticAberrationProps> = ({
  children,
  offset = 4,
  angle = 0,
  edgeOnly = false,
  edgeFalloff = 30,
  animated = false,
  animationType = 'pulse',
  animationSpeed = 60,
  entrance = false,
  entranceDelay = 0,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate offset based on angle
  const radians = (angle * Math.PI) / 180;
  let currentOffset = offset;
  
  // Animation
  if (animated) {
    switch (animationType) {
      case 'pulse':
        currentOffset = offset * (0.5 + Math.sin((frame / animationSpeed) * Math.PI * 2) * 0.5);
        break;
      case 'glitch':
        currentOffset = Math.random() > 0.9 ? offset * 2 : offset * 0.5;
        break;
      case 'breathe':
        currentOffset = offset * interpolate(
          Math.sin((frame / animationSpeed) * Math.PI * 2),
          [-1, 1],
          [0.3, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        break;
    }
  }
  
  // Entrance/exit animation
  if (entrance) {
    const entranceProgress = spring({
      frame: frame - entranceDelay,
      fps,
      config: SPRING_PRESETS.SMOOTH,
    });
    currentOffset = currentOffset * entranceProgress;
  }
  
  if (exitAt !== undefined && frame >= exitAt) {
    const exitProgress = spring({
      frame: frame - exitAt,
      fps,
      config: SPRING_PRESETS.SMOOTH,
    });
    currentOffset = currentOffset * (1 - exitProgress);
  }
  
  const offsetX = Math.cos(radians) * currentOffset;
  const offsetY = Math.sin(radians) * currentOffset;
  
  // Edge-only mask
  const edgeMask = edgeOnly
    ? `radial-gradient(ellipse 80% 80% at 50% 50%, transparent ${100 - edgeFalloff}%, white 100%)`
    : undefined;
  
  return (
    <AbsoluteFill>
      {/* Red channel - offset left/up */}
      <AbsoluteFill
        style={{
          transform: `translate(${-offsetX}px, ${-offsetY}px)`,
          mixBlendMode: 'screen',
          opacity: 0.8,
          WebkitMaskImage: edgeMask,
          maskImage: edgeMask,
        }}
      >
        <div style={{ filter: 'url(#red-only)' }}>
          {children}
        </div>
      </AbsoluteFill>
      
      {/* Green channel - center (original) */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>
      
      {/* Blue channel - offset right/down */}
      <AbsoluteFill
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          mixBlendMode: 'screen',
          opacity: 0.8,
          WebkitMaskImage: edgeMask,
          maskImage: edgeMask,
        }}
      >
        <div style={{ filter: 'url(#blue-only)' }}>
          {children}
        </div>
      </AbsoluteFill>
      
      {/* SVG filters for color channel isolation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="red-only">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
          </filter>
          <filter id="blue-only">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// SIMPLE RGB SPLIT (Lighter weight, for text/simple elements)
// ═══════════════════════════════════════════════════════════════

export interface RGBSplitTextProps {
  children: React.ReactNode;
  offset?: number;
  angle?: number;
}

export const RGBSplitText: React.FC<RGBSplitTextProps> = ({
  children,
  offset = 3,
  angle = 0,
}) => {
  const radians = (angle * Math.PI) / 180;
  const offsetX = Math.cos(radians) * offset;
  const offsetY = Math.sin(radians) * offset;
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Cyan layer (red removed) */}
      <div
        style={{
          position: 'absolute',
          top: -offsetY,
          left: -offsetX,
          color: 'cyan',
          mixBlendMode: 'multiply',
          opacity: 0.7,
        }}
      >
        {children}
      </div>
      
      {/* Main layer */}
      <div style={{ position: 'relative' }}>{children}</div>
      
      {/* Red layer */}
      <div
        style={{
          position: 'absolute',
          top: offsetY,
          left: offsetX,
          color: 'red',
          mixBlendMode: 'multiply',
          opacity: 0.7,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ChromaticAberration;
