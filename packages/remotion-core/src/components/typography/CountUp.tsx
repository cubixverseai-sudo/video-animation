/**
 * 🔢 COUNT UP / ANIMATED NUMBERS
 * Professional number animations for stats, countdowns, and data
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';
import { EASING, EasingName } from '../utils/easings';
import { createGlow } from '../utils/colors';

export interface CountUpProps {
  // Value
  from?: number;
  to: number;
  
  // Formatting
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string; // Thousands separator
  decimalSeparator?: string;
  
  // Styling
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  
  // Animation
  delay?: number;
  duration?: number; // In frames
  easing?: EasingName;
  useSpring?: boolean;
  springPreset?: SpringPresetName;
  
  // Effects
  glow?: boolean;
  glowColor?: string;
  tabularNums?: boolean; // Fixed-width numbers
  
  style?: React.CSSProperties;
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  decimalSeparator = '.',
  fontSize = 80,
  fontFamily = "'JetBrains Mono', 'SF Mono', monospace",
  fontWeight = 700,
  color = '#ffffff',
  delay = 0,
  duration = 60,
  easing = 'EXPO_OUT',
  useSpring = false,
  springPreset = 'SMOOTH',
  glow = false,
  glowColor,
  tabularNums = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const adjustedFrame = Math.max(0, frame - delay);
  
  // Calculate progress
  let progress: number;
  
  if (useSpring) {
    const springConfig = SPRING_PRESETS[springPreset];
    progress = spring({
      frame: adjustedFrame,
      fps,
      config: springConfig,
    });
  } else {
    const easingFn = EASING[easing];
    const linearProgress = Math.min(adjustedFrame / duration, 1);
    progress = easingFn(linearProgress);
  }
  
  // Calculate current value
  const currentValue = from + (to - from) * progress;
  
  // Format number
  const formattedValue = formatNumber(currentValue, {
    decimals,
    separator,
    decimalSeparator,
  });
  
  // Glow effect
  const textShadow = glow 
    ? createGlow(glowColor || color, 0.8) 
    : 'none';
  
  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color,
        textShadow,
        fontVariantNumeric: tabularNums ? 'tabular-nums' : 'normal',
        ...style,
      }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════════

export interface CountdownProps {
  totalSeconds: number;
  delay?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  format?: 'mm:ss' | 'hh:mm:ss' | 'seconds';
  glow?: boolean;
  glowColor?: string;
  onComplete?: () => void;
  style?: React.CSSProperties;
}

export const Countdown: React.FC<CountdownProps> = ({
  totalSeconds,
  delay = 0,
  fontSize = 120,
  fontFamily = "'JetBrains Mono', monospace",
  fontWeight = 700,
  color = '#ffffff',
  format = 'mm:ss',
  glow = true,
  glowColor = '#ff4444',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const adjustedFrame = Math.max(0, frame - delay);
  const elapsedSeconds = adjustedFrame / fps;
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  
  // Format time
  let displayText: string;
  
  if (format === 'seconds') {
    displayText = Math.ceil(remainingSeconds).toString();
  } else {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = Math.ceil(remainingSeconds % 60);
    
    if (format === 'hh:mm:ss') {
      displayText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      displayText = `${pad(minutes)}:${pad(seconds)}`;
    }
  }
  
  // Urgency effect - pulse red when low
  const isUrgent = remainingSeconds <= 10;
  const pulseOpacity = isUrgent 
    ? 0.5 + Math.sin(frame * 0.3) * 0.5 
    : 1;
  
  const textShadow = glow 
    ? createGlow(isUrgent ? glowColor : (glowColor || color), isUrgent ? 1.5 : 0.8)
    : 'none';
  
  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color: isUrgent ? glowColor : color,
        textShadow,
        opacity: pulseOpacity,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {displayText}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ROLLING DIGITS (Slot machine style)
// ═══════════════════════════════════════════════════════════════

export interface RollingDigitsProps {
  value: number;
  delay?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  digitHeight?: number;
  duration?: number;
  staggerPerDigit?: number;
  style?: React.CSSProperties;
}

export const RollingDigits: React.FC<RollingDigitsProps> = ({
  value,
  delay = 0,
  fontSize = 80,
  fontFamily = "'JetBrains Mono', monospace",
  fontWeight = 700,
  color = '#ffffff',
  digitHeight,
  duration = 30,
  staggerPerDigit = 5,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const digits = value.toString().split('');
  const height = digitHeight || fontSize * 1.2;
  
  return (
    <div
      style={{
        display: 'flex',
        fontSize,
        fontFamily,
        fontWeight,
        color,
        fontVariantNumeric: 'tabular-nums',
        overflow: 'hidden',
        ...style,
      }}
    >
      {digits.map((digit, index) => {
        const digitDelay = delay + (index * staggerPerDigit);
        const adjustedFrame = Math.max(0, frame - digitDelay);
        
        const progress = spring({
          frame: adjustedFrame,
          fps,
          config: SPRING_PRESETS.SNAPPY,
        });
        
        const targetDigit = parseInt(digit, 10);
        const currentOffset = interpolate(
          progress,
          [0, 1],
          [targetDigit * height + height * 5, targetDigit * height],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={index}
            style={{
              height,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                transform: `translateY(-${currentOffset}px)`,
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
                <div
                  key={i}
                  style={{
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function formatNumber(
  value: number,
  options: {
    decimals: number;
    separator: string;
    decimalSeparator: string;
  }
): string {
  const { decimals, separator, decimalSeparator } = options;
  
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  
  // Add thousands separator
  const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  return decPart 
    ? `${withSeparator}${decimalSeparator}${decPart}`
    : withSeparator;
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

export default CountUp;
