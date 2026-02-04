/**
 * 📐 GRID BACKGROUND - ENHANCED
 * Professional perspective grid with multiple styles
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

export type GridStyle = 
  | 'perspective'
  | 'flat'
  | 'isometric'
  | 'dots'
  | 'hexagonal'
  | 'radial';

export interface GridBackgroundProps {
  /** Grid style */
  style?: GridStyle;
  /** Grid cell size in pixels */
  cellSize?: number;
  /** Line color */
  lineColor?: string;
  /** Line width */
  lineWidth?: number;
  /** Background color */
  backgroundColor?: string;
  /** Grid opacity */
  opacity?: number;
  /** Perspective depth (for perspective style) */
  perspectiveDepth?: number;
  /** Rotation angle in degrees (for perspective) */
  rotationX?: number;
  /** Animate grid movement */
  animated?: boolean;
  /** Animation speed (pixels per frame) */
  animationSpeed?: number;
  /** Animation direction */
  animationDirection?: 'up' | 'down' | 'left' | 'right';
  /** Add glow to lines */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Fade edges */
  fadeEdges?: boolean;
  /** Fade radius (0-1) */
  fadeRadius?: number;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  style = 'perspective',
  cellSize = 80,
  lineColor = '#1a1a2e',
  lineWidth = 1,
  backgroundColor = '#050508',
  opacity = 0.6,
  perspectiveDepth = 500,
  rotationX = 60,
  animated = true,
  animationSpeed = 0.5,
  animationDirection = 'up',
  glow = false,
  glowColor,
  fadeEdges = true,
  fadeRadius = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Calculate animation offset
  let offsetX = 0;
  let offsetY = 0;
  
  if (animated) {
    const offset = frame * animationSpeed;
    switch (animationDirection) {
      case 'up':
        offsetY = offset % cellSize;
        break;
      case 'down':
        offsetY = -(offset % cellSize);
        break;
      case 'left':
        offsetX = offset % cellSize;
        break;
      case 'right':
        offsetX = -(offset % cellSize);
        break;
    }
  }
  
  // Glow effect for lines
  const glowStyle = glow
    ? `drop-shadow(0 0 3px ${glowColor || lineColor}) drop-shadow(0 0 6px ${glowColor || lineColor})`
    : undefined;
  
  // Fade mask
  const fadeMask = fadeEdges
    ? `radial-gradient(ellipse ${fadeRadius * 100}% ${fadeRadius * 100}% at 50% 50%, black ${fadeRadius * 50}%, transparent ${fadeRadius * 100}%)`
    : undefined;
  
  // Render different grid styles
  const renderGrid = () => {
    switch (style) {
      case 'perspective':
        return (
          <div
            style={{
              position: 'absolute',
              width: '300%',
              height: '300%',
              left: '-100%',
              top: '-50%',
              transform: `perspective(${perspectiveDepth}px) rotateX(${rotationX}deg) translateY(${offsetY}px)`,
              backgroundImage: `
                linear-gradient(${lineColor} ${lineWidth}px, transparent ${lineWidth}px),
                linear-gradient(90deg, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px)
              `,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              filter: glowStyle,
            }}
          />
        );
      
      case 'flat':
        return (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              backgroundImage: `
                linear-gradient(${lineColor} ${lineWidth}px, transparent ${lineWidth}px),
                linear-gradient(90deg, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px)
              `,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              filter: glowStyle,
            }}
          />
        );
      
      case 'dots':
        return (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              backgroundImage: `radial-gradient(circle, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px)`,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              filter: glowStyle,
            }}
          />
        );
      
      case 'radial':
        const circles = Array.from({ length: 10 }, (_, i) => (i + 1) * cellSize);
        return (
          <>
            {circles.map((radius, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: radius * 2,
                  height: radius * 2,
                  transform: 'translate(-50%, -50%)',
                  border: `${lineWidth}px solid ${lineColor}`,
                  borderRadius: '50%',
                  opacity: 1 - (i * 0.08),
                  filter: glowStyle,
                }}
              />
            ))}
            {/* Radial lines */}
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={`line-${i}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 1,
                  height: '100%',
                  backgroundColor: lineColor,
                  transform: `translateX(-50%) rotate(${i * 30 + (animated ? frame * 0.1 : 0)}deg)`,
                  transformOrigin: 'center center',
                  opacity: 0.3,
                }}
              />
            ))}
          </>
        );
      
      case 'isometric':
        return (
          <div
            style={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              left: '-50%',
              top: '-50%',
              transform: `rotate(45deg) translate(${offsetX}px, ${offsetY}px)`,
              backgroundImage: `
                linear-gradient(${lineColor} ${lineWidth}px, transparent ${lineWidth}px),
                linear-gradient(90deg, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px)
              `,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              filter: glowStyle,
            }}
          />
        );
      
      case 'hexagonal':
        // Hexagonal pattern using CSS
        const hexSize = cellSize;
        return (
          <svg
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              filter: glowStyle,
            }}
          >
            <defs>
              <pattern
                id="hexagons"
                width={hexSize * 1.5}
                height={hexSize * 1.732}
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points={`${hexSize * 0.5},0 ${hexSize * 1.5},0 ${hexSize * 1.75},${hexSize * 0.866} ${hexSize * 1.5},${hexSize * 1.732} ${hexSize * 0.5},${hexSize * 1.732} ${hexSize * 0.25},${hexSize * 0.866}`}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity,
          WebkitMaskImage: fadeMask,
          maskImage: fadeMask,
        }}
      >
        {renderGrid()}
      </div>
    </AbsoluteFill>
  );
};

export default GridBackground;
