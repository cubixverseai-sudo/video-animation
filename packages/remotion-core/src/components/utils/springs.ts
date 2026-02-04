/**
 * 🎬 SPRING PHYSICS PRESETS
 * Professional motion configurations for cinematic animations
 */

import { spring, SpringConfig } from 'remotion';

// ═══════════════════════════════════════════════════════════════
// SPRING PRESETS
// ═══════════════════════════════════════════════════════════════

export const SPRING_PRESETS = {
  // Smooth, elegant - no overshoot (UI reveals, subtle animations)
  SMOOTH: { damping: 200 } as SpringConfig,
  
  // Snappy with minimal bounce (UI feedback, quick reveals)
  SNAPPY: { damping: 20, stiffness: 200 } as SpringConfig,
  
  // Bouncy entrance (playful, attention-grabbing)
  BOUNCY: { damping: 8 } as SpringConfig,
  
  // Heavy, slow, dramatic (cinematic reveals, logos)
  DRAMATIC: { damping: 15, stiffness: 80, mass: 2 } as SpringConfig,
  
  // Logo reveal - balanced overshoot
  LOGO_REVEAL: { damping: 12, stiffness: 100, mass: 1.2 } as SpringConfig,
  
  // Elastic with multiple bounces (fun, celebrations)
  ELASTIC: { damping: 6, stiffness: 150 } as SpringConfig,
  
  // Cinematic - film-quality motion
  CINEMATIC: { damping: 18, stiffness: 60, mass: 1.8 } as SpringConfig,
  
  // Text reveal - optimized for typography
  TEXT_REVEAL: { damping: 14, stiffness: 120, mass: 0.9 } as SpringConfig,
  
  // Impact - strong arrival with minimal bounce
  IMPACT: { damping: 25, stiffness: 300, mass: 1 } as SpringConfig,
  
  // Gentle float (background elements, subtle drift)
  FLOAT: { damping: 30, stiffness: 40, mass: 1.5 } as SpringConfig,
  
  // Quick pop (notifications, badges)
  POP: { damping: 10, stiffness: 400, mass: 0.5 } as SpringConfig,
  
  // Exit animation - smooth departure
  EXIT: { damping: 200, stiffness: 100 } as SpringConfig,
} as const;

export type SpringPresetName = keyof typeof SPRING_PRESETS;

// ═══════════════════════════════════════════════════════════════
// SPRING HELPERS
// ═══════════════════════════════════════════════════════════════

interface CreateSpringOptions {
  frame: number;
  fps: number;
  delay?: number;
  preset?: SpringPresetName;
  config?: SpringConfig;
  durationInFrames?: number;
  reverse?: boolean;
}

/**
 * Create a spring animation with preset or custom config
 */
export const createSpring = ({
  frame,
  fps,
  delay = 0,
  preset = 'SMOOTH',
  config,
  durationInFrames,
  reverse = false,
}: CreateSpringOptions): number => {
  const springConfig = config || SPRING_PRESETS[preset];
  
  const value = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
    durationInFrames,
  });
  
  return reverse ? 1 - value : value;
};

/**
 * Create a spring that goes from 0 to 1 to 0 (in and out)
 */
export const createSpringInOut = ({
  frame,
  fps,
  delayIn = 0,
  delayOut,
  presetIn = 'SMOOTH',
  presetOut = 'EXIT',
  totalDuration,
}: {
  frame: number;
  fps: number;
  delayIn?: number;
  delayOut: number;
  presetIn?: SpringPresetName;
  presetOut?: SpringPresetName;
  totalDuration?: number;
}): number => {
  const enter = createSpring({ frame, fps, delay: delayIn, preset: presetIn });
  const exit = createSpring({ frame, fps, delay: delayOut, preset: presetOut, reverse: true });
  
  return Math.min(enter, exit);
};

/**
 * Stagger delay calculator for sequential animations
 */
export const staggerDelay = (
  index: number,
  staggerFrames: number = 3,
  baseDelay: number = 0
): number => {
  return baseDelay + (index * staggerFrames);
};

/**
 * Calculate spring delay for wave effect
 */
export const waveDelay = (
  index: number,
  total: number,
  staggerFrames: number = 3,
  baseDelay: number = 0
): number => {
  // Creates a wave pattern instead of linear
  const position = index / total;
  const wave = Math.sin(position * Math.PI) * 0.5 + 0.5;
  return baseDelay + Math.floor(wave * total * staggerFrames);
};
