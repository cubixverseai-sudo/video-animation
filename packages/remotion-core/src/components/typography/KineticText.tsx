/**
 * 🔤 KINETIC TEXT - ENHANCED
 * Professional per-character animated text with multiple animation presets
 */

import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { SPRING_PRESETS, SpringPresetName, staggerDelay } from '../utils/springs';
import { EASING, EasingName } from '../utils/easings';
import { createGlow, createTextShadow, rgba } from '../utils/colors';

// ═══════════════════════════════════════════════════════════════
// ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════

export type AnimationPreset = 
  | 'flipUp'
  | 'flipDown'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleUp'
  | 'scalePop'
  | 'fadeIn'
  | 'blurIn'
  | 'rotateIn'
  | 'bounceIn'
  | 'elasticIn'
  | 'glitchIn'
  | 'waveIn'
  | 'spiralIn'
  | 'dropIn'
  | 'zoomBlur';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

export interface KineticTextProps {
  text: string;
  
  // Styling
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Effects
  gradient?: string;
  glow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  shadow?: boolean;
  stroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Animation
  animation?: AnimationPreset;
  springPreset?: SpringPresetName;
  easing?: EasingName;
  delay?: number;
  staggerPerChar?: number;
  staggerPerWord?: number;
  animateBy?: 'char' | 'word' | 'line';
  
  // Exit animation
  exitAnimation?: AnimationPreset;
  exitDelay?: number;
  exitSpringPreset?: SpringPresetName;
  
  // Advanced
  perspective?: number;
  maxWidth?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize = 80,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 700,
  color = '#ffffff',
  letterSpacing = 0,
  lineHeight = 1.2,
  textAlign = 'center',
  textTransform = 'none',
  gradient,
  glow = false,
  glowColor,
  glowIntensity = 1,
  shadow = true,
  stroke = false,
  strokeColor = 'rgba(255,255,255,0.2)',
  strokeWidth = 2,
  animation = 'flipUp',
  springPreset = 'TEXT_REVEAL',
  easing,
  delay = 0,
  staggerPerChar = 2,
  staggerPerWord = 5,
  animateBy = 'char',
  exitAnimation,
  exitDelay,
  exitSpringPreset = 'EXIT',
  perspective = 1000,
  maxWidth,
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split text into animatable units
  const units = useMemo(() => {
    if (animateBy === 'word') {
      return text.split(' ').map(word => ({ type: 'word' as const, content: word }));
    }
    if (animateBy === 'line') {
      return text.split('\n').map(line => ({ type: 'line' as const, content: line }));
    }
    // Default: by character
    const words = text.split(' ');
    const result: Array<{ type: 'char' | 'space'; content: string; wordIndex: number }> = [];
    words.forEach((word, wordIndex) => {
      word.split('').forEach(char => {
        result.push({ type: 'char', content: char, wordIndex });
      });
      if (wordIndex < words.length - 1) {
        result.push({ type: 'space', content: ' ', wordIndex });
      }
    });
    return result;
  }, [text, animateBy]);

  // Calculate glow effect
  const glowEffect = glow ? createGlow(glowColor || color, glowIntensity) : undefined;
  const shadowEffect = shadow ? createTextShadow(color, 8) : undefined;
  const textShadow = [glowEffect, shadowEffect].filter(Boolean).join(', ') || 'none';

  // Base text styles
  const baseStyles: React.CSSProperties = {
    fontFamily,
    fontWeight,
    fontSize,
    color: gradient ? 'transparent' : color,
    letterSpacing,
    lineHeight,
    textAlign,
    textTransform,
    textShadow,
    ...(gradient && {
      background: gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }),
    ...(stroke && {
      WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
    }),
    perspective: `${perspective}px`,
    maxWidth,
    ...style,
  };

  // Animation calculator
  const getAnimationStyles = (
    index: number,
    wordIndex: number = 0
  ): React.CSSProperties => {
    // Calculate stagger delay
    const charDelay = animateBy === 'char'
      ? delay + (wordIndex * staggerPerWord) + (index * staggerPerChar)
      : delay + (index * staggerPerWord);

    // Calculate spring progress
    const springConfig = SPRING_PRESETS[springPreset];
    const progress = spring({
      frame: frame - charDelay,
      fps,
      config: springConfig,
    });

    // Calculate exit progress if needed
    let exitProgress = 1;
    if (exitAnimation && exitDelay !== undefined) {
      const exitConfig = SPRING_PRESETS[exitSpringPreset];
      exitProgress = 1 - spring({
        frame: frame - exitDelay - (index * staggerPerChar),
        fps,
        config: exitConfig,
      });
    }

    const finalProgress = Math.min(progress, exitProgress);

    // Get animation transform and opacity
    return getAnimationTransform(animation, finalProgress, index, fps, frame, charDelay);
  };

  return (
    <div style={baseStyles} className={className}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}>
        {units.map((unit, index) => {
          if (unit.type === 'space') {
            return <span key={index} style={{ width: fontSize * 0.3 }} />;
          }

          const animStyles = getAnimationStyles(
            index,
            'wordIndex' in unit ? unit.wordIndex : 0
          );

          if (animateBy === 'word' || animateBy === 'line') {
            return (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  marginRight: animateBy === 'word' ? fontSize * 0.3 : 0,
                  whiteSpace: animateBy === 'line' ? 'pre' : 'normal',
                  ...animStyles,
                }}
              >
                {unit.content}
              </span>
            );
          }

          // Character animation
          return (
            <span
              key={index}
              style={{
                display: 'inline-block',
                ...animStyles,
              }}
            >
              {unit.content}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ANIMATION TRANSFORM CALCULATOR
// ═══════════════════════════════════════════════════════════════

function getAnimationTransform(
  animation: AnimationPreset,
  progress: number,
  index: number,
  fps: number,
  frame: number,
  delay: number
): React.CSSProperties {
  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  switch (animation) {
    case 'flipUp':
      return {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `
          rotateX(${interpolate(progress, [0, 1], [90, 0], clamp)}deg)
          translateY(${interpolate(progress, [0, 1], [30, 0], clamp)}px)
        `,
        transformOrigin: 'bottom center',
      };

    case 'flipDown':
      return {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `
          rotateX(${interpolate(progress, [0, 1], [-90, 0], clamp)}deg)
          translateY(${interpolate(progress, [0, 1], [-30, 0], clamp)}px)
        `,
        transformOrigin: 'top center',
      };

    case 'slideUp':
      return {
        opacity: interpolate(progress, [0, 0.6], [0, 1], clamp),
        transform: `translateY(${interpolate(progress, [0, 1], [60, 0], clamp)}px)`,
      };

    case 'slideDown':
      return {
        opacity: interpolate(progress, [0, 0.6], [0, 1], clamp),
        transform: `translateY(${interpolate(progress, [0, 1], [-60, 0], clamp)}px)`,
      };

    case 'slideLeft':
      return {
        opacity: interpolate(progress, [0, 0.6], [0, 1], clamp),
        transform: `translateX(${interpolate(progress, [0, 1], [60, 0], clamp)}px)`,
      };

    case 'slideRight':
      return {
        opacity: interpolate(progress, [0, 0.6], [0, 1], clamp),
        transform: `translateX(${interpolate(progress, [0, 1], [-60, 0], clamp)}px)`,
      };

    case 'scaleUp':
      return {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `scale(${interpolate(progress, [0, 1], [0, 1], clamp)})`,
      };

    case 'scalePop':
      // Scale with overshoot
      const scaleValue = interpolate(progress, [0, 0.7, 1], [0, 1.2, 1], clamp);
      return {
        opacity: interpolate(progress, [0, 0.3], [0, 1], clamp),
        transform: `scale(${scaleValue})`,
      };

    case 'fadeIn':
      return {
        opacity: interpolate(progress, [0, 1], [0, 1], clamp),
      };

    case 'blurIn':
      return {
        opacity: interpolate(progress, [0, 0.7], [0, 1], clamp),
        filter: `blur(${interpolate(progress, [0, 1], [20, 0], clamp)}px)`,
      };

    case 'rotateIn':
      return {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `
          rotate(${interpolate(progress, [0, 1], [180, 0], clamp)}deg)
          scale(${interpolate(progress, [0, 1], [0, 1], clamp)})
        `,
      };

    case 'bounceIn':
      const bounceScale = interpolate(
        progress,
        [0, 0.4, 0.6, 0.8, 1],
        [0, 1.3, 0.9, 1.05, 1],
        clamp
      );
      return {
        opacity: interpolate(progress, [0, 0.2], [0, 1], clamp),
        transform: `scale(${bounceScale})`,
      };

    case 'elasticIn':
      const elasticOffset = interpolate(
        progress,
        [0, 0.3, 0.5, 0.7, 0.85, 1],
        [100, -20, 10, -5, 2, 0],
        clamp
      );
      return {
        opacity: interpolate(progress, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${elasticOffset}px)`,
      };

    case 'glitchIn':
      // Random glitch offsets
      const glitchX = frame - delay < 10 
        ? (random(`glitch-x-${index}-${Math.floor(frame / 2)}`) - 0.5) * 20
        : 0;
      const glitchOpacity = frame - delay < 10
        ? random(`glitch-o-${index}-${Math.floor(frame / 3)}`) > 0.3 ? 1 : 0
        : interpolate(progress, [0, 0.5], [0, 1], clamp);
      
      return {
        opacity: glitchOpacity,
        transform: `translateX(${glitchX}px)`,
      };

    case 'waveIn':
      const waveY = interpolate(progress, [0, 0.5, 1], [50, -10, 0], clamp);
      return {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `translateY(${waveY}px)`,
      };

    case 'spiralIn':
      return {
        opacity: interpolate(progress, [0, 0.5], [0, 1], clamp),
        transform: `
          rotate(${interpolate(progress, [0, 1], [360, 0], clamp)}deg)
          scale(${interpolate(progress, [0, 1], [0, 1], clamp)})
          translateY(${interpolate(progress, [0, 1], [-50, 0], clamp)}px)
        `,
      };

    case 'dropIn':
      const dropY = interpolate(progress, [0, 0.7, 0.85, 1], [-200, 10, -5, 0], clamp);
      return {
        opacity: interpolate(progress, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${dropY}px)`,
      };

    case 'zoomBlur':
      return {
        opacity: interpolate(progress, [0, 0.6], [0, 1], clamp),
        transform: `scale(${interpolate(progress, [0, 1], [3, 1], clamp)})`,
        filter: `blur(${interpolate(progress, [0, 1], [30, 0], clamp)}px)`,
      };

    default:
      return {
        opacity: interpolate(progress, [0, 1], [0, 1], clamp),
      };
  }
}

export default KineticText;
