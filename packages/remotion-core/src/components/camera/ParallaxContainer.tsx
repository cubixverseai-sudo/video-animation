/**
 * 🎭 PARALLAX CONTAINER
 * Multi-layer parallax effect for depth
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ParallaxLayerConfig {
  /** Unique layer identifier */
  id: string;
  /** Layer content */
  children: React.ReactNode;
  /** Depth/speed multiplier (0 = static, 1 = full speed, >1 = faster) */
  depth: number;
  /** Z-index for stacking */
  zIndex?: number;
  /** Apply blur based on depth */
  depthBlur?: boolean;
  /** Custom blur amount */
  blurAmount?: number;
  /** Opacity */
  opacity?: number;
}

export interface ParallaxContainerProps {
  /** Parallax layers */
  layers: ParallaxLayerConfig[];
  
  /** Movement direction */
  direction?: 'horizontal' | 'vertical' | 'both';
  
  /** Base movement speed (pixels per frame) */
  speed?: number;
  
  /** Enable mouse-follow effect (only works in preview) */
  mouseFollow?: boolean;
  
  /** Use camera-based movement (responds to camera position) */
  cameraX?: number;
  cameraY?: number;
  
  /** Scale movement range */
  range?: number;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  layers,
  direction = 'both',
  speed = 0.5,
  mouseFollow = false,
  cameraX = 0,
  cameraY = 0,
  range = 100,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Calculate base movement
  const baseX = direction !== 'vertical' ? frame * speed : 0;
  const baseY = direction !== 'horizontal' ? frame * speed : 0;
  
  // Add camera offset
  const totalX = baseX + cameraX;
  const totalY = baseY + cameraY;
  
  return (
    <AbsoluteFill>
      {layers
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((layer) => {
          const offsetX = totalX * layer.depth * (range / 100);
          const offsetY = totalY * layer.depth * (range / 100);
          
          // Calculate blur based on depth (deeper = more blur)
          const blur = layer.depthBlur
            ? layer.blurAmount ?? Math.abs(1 - layer.depth) * 5
            : 0;
          
          return (
            <AbsoluteFill
              key={layer.id}
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px)`,
                zIndex: layer.zIndex || 0,
                filter: blur > 0 ? `blur(${blur}px)` : undefined,
                opacity: layer.opacity ?? 1,
              }}
            >
              {layer.children}
            </AbsoluteFill>
          );
        })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// SIMPLE PARALLAX WRAPPER (For single elements)
// ═══════════════════════════════════════════════════════════════

export interface ParallaxProps {
  children: React.ReactNode;
  /** Depth multiplier */
  depth?: number;
  /** Movement direction */
  direction?: 'horizontal' | 'vertical' | 'both';
  /** Speed */
  speed?: number;
  /** Offset range */
  range?: number;
  /** Add depth blur */
  blur?: boolean;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  depth = 0.5,
  direction = 'both',
  speed = 1,
  range = 50,
  blur = false,
}) => {
  const frame = useCurrentFrame();
  
  const offsetX = direction !== 'vertical' 
    ? Math.sin(frame * 0.02 * speed) * range * depth 
    : 0;
  const offsetY = direction !== 'horizontal' 
    ? Math.cos(frame * 0.015 * speed) * range * depth 
    : 0;
  
  const blurAmount = blur ? Math.abs(1 - depth) * 3 : 0;
  
  return (
    <div
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DEPTH LAYERS (Pre-configured background/mid/foreground)
// ═══════════════════════════════════════════════════════════════

export interface DepthLayersProps {
  background?: React.ReactNode;
  midground?: React.ReactNode;
  foreground?: React.ReactNode;
  content?: React.ReactNode;
  
  /** Movement speed */
  speed?: number;
  /** Movement type */
  movement?: 'drift' | 'scroll' | 'none';
  /** Enable depth blur */
  depthBlur?: boolean;
}

export const DepthLayers: React.FC<DepthLayersProps> = ({
  background,
  midground,
  foreground,
  content,
  speed = 0.5,
  movement = 'drift',
  depthBlur = true,
}) => {
  const frame = useCurrentFrame();
  
  // Pre-defined depth values
  const depths = {
    background: 0.2,
    midground: 0.5,
    content: 1,
    foreground: 1.3,
  };
  
  // Calculate offsets based on movement type
  const getOffset = (depth: number) => {
    if (movement === 'none') return { x: 0, y: 0 };
    
    if (movement === 'drift') {
      return {
        x: Math.sin(frame * 0.015 * speed) * 30 * depth,
        y: Math.cos(frame * 0.01 * speed) * 20 * depth,
      };
    }
    
    // scroll
    return {
      x: frame * speed * depth * 0.5,
      y: 0,
    };
  };
  
  const layers = [
    { key: 'bg', content: background, depth: depths.background, blur: depthBlur ? 4 : 0, zIndex: 0 },
    { key: 'mid', content: midground, depth: depths.midground, blur: depthBlur ? 1 : 0, zIndex: 1 },
    { key: 'content', content: content, depth: depths.content, blur: 0, zIndex: 2 },
    { key: 'fg', content: foreground, depth: depths.foreground, blur: depthBlur ? 2 : 0, zIndex: 3 },
  ];
  
  return (
    <AbsoluteFill>
      {layers.map(layer => {
        if (!layer.content) return null;
        
        const offset = getOffset(layer.depth);
        
        return (
          <AbsoluteFill
            key={layer.key}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              zIndex: layer.zIndex,
              filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
            }}
          >
            {layer.content}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCROLL PARALLAX (For scrolling content)
// ═══════════════════════════════════════════════════════════════

export interface ScrollParallaxProps {
  children: React.ReactNode;
  /** Scroll direction */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Scroll speed (pixels per frame) */
  speed?: number;
  /** Start offset */
  startOffset?: number;
  /** Enable looping */
  loop?: boolean;
  /** Loop threshold (when to reset) */
  loopThreshold?: number;
}

export const ScrollParallax: React.FC<ScrollParallaxProps> = ({
  children,
  direction = 'up',
  speed = 2,
  startOffset = 0,
  loop = false,
  loopThreshold = 1000,
}) => {
  const frame = useCurrentFrame();
  
  let offset = startOffset + frame * speed;
  
  if (loop) {
    offset = offset % loopThreshold;
  }
  
  const transform = {
    up: `translateY(-${offset}px)`,
    down: `translateY(${offset}px)`,
    left: `translateX(-${offset}px)`,
    right: `translateX(${offset}px)`,
  }[direction];
  
  return (
    <div style={{ transform }}>
      {children}
    </div>
  );
};

export default ParallaxContainer;
