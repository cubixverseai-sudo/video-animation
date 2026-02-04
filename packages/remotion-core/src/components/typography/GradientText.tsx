/**
 * 🌈 GRADIENT TEXT
 * Animated gradient text with multiple effects
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';
import { GRADIENTS } from '../utils/colors';

export type GradientPreset = keyof typeof GRADIENTS | 'custom';

export interface GradientTextProps {
  text: string;
  
  // Gradient
  gradient?: string;
  gradientPreset?: GradientPreset;
  animateGradient?: boolean;
  gradientSpeed?: number; // Degrees per frame
  
  // Styling
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  
  // Animation
  delay?: number;
  springPreset?: SpringPresetName;
  entrance?: 'fade' | 'scale' | 'slideUp' | 'none';
  
  // Effects
  glow?: boolean;
  glowColor?: string;
  shadow?: boolean;
  
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  gradient,
  gradientPreset = 'TEXT_INDIGO_VIOLET',
  animateGradient = false,
  gradientSpeed = 2,
  fontSize = 80,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 800,
  letterSpacing = -2,
  textAlign = 'center',
  delay = 0,
  springPreset = 'SMOOTH',
  entrance = 'fade',
  glow = true,
  glowColor,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Get gradient value
  const gradientValue = gradient || (
    gradientPreset !== 'custom' 
      ? GRADIENTS[gradientPreset as keyof typeof GRADIENTS] 
      : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  );
  
  // Animate gradient rotation
  const gradientRotation = animateGradient ? frame * gradientSpeed : 135;
  const animatedGradient = gradientValue.replace(
    /\d+deg/,
    `${gradientRotation}deg`
  );
  
  // Entrance animation
  const springConfig = SPRING_PRESETS[springPreset];
  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
  });
  
  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  
  let entranceStyles: React.CSSProperties = {};
  switch (entrance) {
    case 'fade':
      entranceStyles = {
        opacity: interpolate(progress, [0, 1], [0, 1], clamp),
      };
      break;
    case 'scale':
      entranceStyles = {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `scale(${interpolate(progress, [0, 1], [0.8, 1], clamp)})`,
      };
      break;
    case 'slideUp':
      entranceStyles = {
        opacity: interpolate(progress, [0, 0.6], [0, 1], clamp),
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0], clamp)}px)`,
      };
      break;
  }
  
  // Effects
  const glowShadow = glow 
    ? `0 0 30px ${glowColor || 'rgba(99, 102, 241, 0.4)'}, 0 0 60px ${glowColor || 'rgba(99, 102, 241, 0.2)'}`
    : '';
  const dropShadow = shadow ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '';
  const textShadow = [glowShadow, dropShadow].filter(Boolean).join(', ') || 'none';
  
  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        letterSpacing,
        textAlign,
        background: animatedGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow,
        ...entranceStyles,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SHIMMER TEXT (Animated shine effect)
// ═══════════════════════════════════════════════════════════════

export interface ShimmerTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  baseColor?: string;
  shimmerColor?: string;
  shimmerSpeed?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
  text,
  fontSize = 80,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 800,
  baseColor = '#888888',
  shimmerColor = '#ffffff',
  shimmerSpeed = 3, // Percent per frame
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  
  // Calculate shimmer position (cycles from -50% to 150%)
  const shimmerPosition = ((frame - delay) * shimmerSpeed) % 200 - 50;
  
  const gradient = `linear-gradient(
    90deg,
    ${baseColor} 0%,
    ${baseColor} ${shimmerPosition - 20}%,
    ${shimmerColor} ${shimmerPosition}%,
    ${baseColor} ${shimmerPosition + 20}%,
    ${baseColor} 100%
  )`;
  
  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundSize: '200% 100%',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export default GradientText;
