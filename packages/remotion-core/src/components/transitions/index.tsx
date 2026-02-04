/**
 * 🎬 TRANSITION COMPONENTS
 * Professional scene transitions
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, random } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';
import { EASING, EasingName } from '../utils/easings';

// ═══════════════════════════════════════════════════════════════
// GLITCH TRANSITION
// ═══════════════════════════════════════════════════════════════

export interface GlitchTransitionProps {
  children: React.ReactNode;
  /** When to start the transition */
  startFrame: number;
  /** Duration of the transition */
  duration?: number;
  /** Glitch intensity */
  intensity?: number;
  /** Show content after transition */
  revealing?: boolean;
}

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  children,
  startFrame,
  duration = 15,
  intensity = 1,
  revealing = true,
}) => {
  const frame = useCurrentFrame();
  
  const localFrame = frame - startFrame;
  const progress = localFrame / duration;
  const isActive = localFrame >= 0 && localFrame < duration;
  const isComplete = localFrame >= duration;
  
  // Show content based on revealing mode
  const showContent = revealing ? isComplete : localFrame < 0;
  
  if (!isActive && !showContent) {
    return revealing ? null : <AbsoluteFill>{children}</AbsoluteFill>;
  }
  
  if (!isActive && showContent) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  
  // Glitch effects during transition
  const seed = Math.floor(localFrame / 2);
  const shouldGlitch = random(`glitch-${seed}`) > 0.3;
  
  const offsetX = shouldGlitch ? (random(`offset-x-${seed}`) - 0.5) * 30 * intensity : 0;
  const offsetY = shouldGlitch ? (random(`offset-y-${seed}`) - 0.5) * 20 * intensity : 0;
  const scaleX = shouldGlitch ? 1 + (random(`scale-x-${seed}`) - 0.5) * 0.1 * intensity : 1;
  
  // RGB split
  const rgbOffset = shouldGlitch ? intensity * 5 : 0;
  
  // Slice effect
  const sliceTop = shouldGlitch ? random(`slice-top-${seed}`) * 100 : 0;
  const sliceHeight = shouldGlitch ? 5 + random(`slice-height-${seed}`) * 20 : 0;
  
  // Flash
  const flash = random(`flash-${seed}`) > 0.7;
  
  return (
    <AbsoluteFill>
      {/* Main content with glitch */}
      <AbsoluteFill
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scaleX(${scaleX})`,
          opacity: revealing ? progress : 1 - progress,
        }}
      >
        {children}
      </AbsoluteFill>
      
      {/* RGB split layers */}
      {shouldGlitch && rgbOffset > 0 && (
        <>
          <AbsoluteFill
            style={{
              transform: `translateX(${-rgbOffset}px)`,
              mixBlendMode: 'screen',
              opacity: 0.5,
            }}
          >
            <div style={{ filter: 'url(#red-filter)' }}>{children}</div>
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `translateX(${rgbOffset}px)`,
              mixBlendMode: 'screen',
              opacity: 0.5,
            }}
          >
            <div style={{ filter: 'url(#blue-filter)' }}>{children}</div>
          </AbsoluteFill>
        </>
      )}
      
      {/* Slice glitch */}
      {shouldGlitch && (
        <AbsoluteFill
          style={{
            clipPath: `inset(${sliceTop}% 0 ${100 - sliceTop - sliceHeight}% 0)`,
            transform: `translateX(${(random(`slice-offset-${seed}`) - 0.5) * 40}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      )}
      
      {/* Flash overlay */}
      {flash && (
        <AbsoluteFill
          style={{
            backgroundColor: 'white',
            opacity: 0.3,
          }}
        />
      )}
      
      {/* SVG filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="red-filter">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
          <filter id="blue-filter">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// MASK REVEAL TRANSITION
// ═══════════════════════════════════════════════════════════════

export type MaskShape = 
  | 'circle'
  | 'rectangle'
  | 'diamond'
  | 'horizontal-wipe'
  | 'vertical-wipe'
  | 'diagonal-wipe'
  | 'iris';

export interface MaskRevealProps {
  children: React.ReactNode;
  /** When to start */
  startFrame: number;
  /** Duration */
  duration?: number;
  /** Mask shape */
  shape?: MaskShape;
  /** Reveal from center or edges */
  direction?: 'in' | 'out';
  /** Center position X (%) */
  centerX?: number;
  /** Center position Y (%) */
  centerY?: number;
  /** Use spring animation */
  useSpring?: boolean;
  /** Spring preset */
  springPreset?: SpringPresetName;
  /** Easing */
  easing?: EasingName;
  /** Feather edge */
  feather?: number;
}

export const MaskReveal: React.FC<MaskRevealProps> = ({
  children,
  startFrame,
  duration = 30,
  shape = 'circle',
  direction = 'in',
  centerX = 50,
  centerY = 50,
  useSpring: useSpringAnim = true,
  springPreset = 'SMOOTH',
  easing = 'EXPO_OUT',
  feather = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const localFrame = frame - startFrame;
  
  if (localFrame < 0) {
    return direction === 'in' ? null : <AbsoluteFill>{children}</AbsoluteFill>;
  }
  
  // Calculate progress
  let progress: number;
  if (useSpringAnim) {
    progress = spring({
      frame: localFrame,
      fps,
      config: SPRING_PRESETS[springPreset],
    });
  } else {
    const easingFn = EASING[easing];
    progress = easingFn(Math.min(localFrame / duration, 1));
  }
  
  // Reverse for 'out' direction
  if (direction === 'out') {
    progress = 1 - progress;
  }
  
  // Generate clip path based on shape
  let clipPath: string;
  
  switch (shape) {
    case 'circle':
      const radius = progress * Math.max(width, height);
      clipPath = `circle(${radius}px at ${centerX}% ${centerY}%)`;
      break;
    
    case 'rectangle':
      const size = progress * 50;
      clipPath = `inset(${50 - size}% ${50 - size}% ${50 - size}% ${50 - size}%)`;
      break;
    
    case 'diamond':
      const diamondSize = progress * 100;
      clipPath = `polygon(
        ${centerX}% ${centerY - diamondSize}%,
        ${centerX + diamondSize}% ${centerY}%,
        ${centerX}% ${centerY + diamondSize}%,
        ${centerX - diamondSize}% ${centerY}%
      )`;
      break;
    
    case 'horizontal-wipe':
      clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
      break;
    
    case 'vertical-wipe':
      clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;
      break;
    
    case 'diagonal-wipe':
      const diagProgress = progress * 200 - 50;
      clipPath = `polygon(
        0% ${diagProgress}%,
        100% ${diagProgress - 100}%,
        100% 100%,
        0% 100%
      )`;
      break;
    
    case 'iris':
      // Iris effect (circular segments)
      const irisRadius = progress * 150;
      clipPath = `circle(${irisRadius}% at ${centerX}% ${centerY}%)`;
      break;
    
    default:
      clipPath = 'none';
  }
  
  return (
    <AbsoluteFill
      style={{
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// ZOOM TRANSITION
// ═══════════════════════════════════════════════════════════════

export interface ZoomTransitionProps {
  children: React.ReactNode;
  startFrame: number;
  duration?: number;
  direction?: 'in' | 'out';
  scaleFrom?: number;
  scaleTo?: number;
  blur?: boolean;
  springPreset?: SpringPresetName;
}

export const ZoomTransition: React.FC<ZoomTransitionProps> = ({
  children,
  startFrame,
  duration = 30,
  direction = 'in',
  scaleFrom = direction === 'in' ? 0.5 : 1,
  scaleTo = direction === 'in' ? 1 : 1.5,
  blur = true,
  springPreset = 'SMOOTH',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const localFrame = frame - startFrame;
  
  if (localFrame < 0) {
    return direction === 'in' ? null : <AbsoluteFill>{children}</AbsoluteFill>;
  }
  
  const progress = spring({
    frame: localFrame,
    fps,
    config: SPRING_PRESETS[springPreset],
  });
  
  const scale = interpolate(progress, [0, 1], [scaleFrom, scaleTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const opacity = direction === 'in'
    ? interpolate(progress, [0, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(progress, [0.5, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const blurAmount = blur
    ? interpolate(progress, [0, 1], direction === 'in' ? [20, 0] : [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// SLIDE TRANSITION
// ═══════════════════════════════════════════════════════════════

export interface SlideTransitionProps {
  children: React.ReactNode;
  startFrame: number;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  revealing?: boolean;
  springPreset?: SpringPresetName;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  startFrame,
  duration = 30,
  direction = 'left',
  revealing = true,
  springPreset = 'SMOOTH',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const localFrame = frame - startFrame;
  
  if (localFrame < 0) {
    return revealing ? null : <AbsoluteFill>{children}</AbsoluteFill>;
  }
  
  const progress = spring({
    frame: localFrame,
    fps,
    config: SPRING_PRESETS[springPreset],
  });
  
  const finalProgress = revealing ? progress : 1 - progress;
  
  const offsets = {
    left: { x: width * (1 - finalProgress), y: 0 },
    right: { x: -width * (1 - finalProgress), y: 0 },
    up: { x: 0, y: height * (1 - finalProgress) },
    down: { x: 0, y: -height * (1 - finalProgress) },
  };
  
  const { x, y } = offsets[direction];
  
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default MaskReveal;
