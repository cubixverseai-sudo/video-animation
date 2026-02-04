/**
 * 🎬 EASING FUNCTIONS LIBRARY
 * Comprehensive easing presets for professional motion
 */

import { Easing } from 'remotion';

// ═══════════════════════════════════════════════════════════════
// EASING PRESETS
// ═══════════════════════════════════════════════════════════════

export const EASING = {
  // ─── POWER CURVES ───
  POWER1_IN: Easing.in(Easing.quad),
  POWER1_OUT: Easing.out(Easing.quad),
  POWER1_INOUT: Easing.inOut(Easing.quad),
  
  POWER2_IN: Easing.in(Easing.cubic),
  POWER2_OUT: Easing.out(Easing.cubic),
  POWER2_INOUT: Easing.inOut(Easing.cubic),
  
  POWER3_IN: Easing.in((t) => t * t * t * t),
  POWER3_OUT: Easing.out((t) => t * t * t * t),
  POWER3_INOUT: Easing.inOut((t) => t * t * t * t),
  
  POWER4_IN: Easing.in((t) => t * t * t * t * t),
  POWER4_OUT: Easing.out((t) => t * t * t * t * t),
  POWER4_INOUT: Easing.inOut((t) => t * t * t * t * t),
  
  // ─── EXPONENTIAL ───
  EXPO_IN: Easing.in(Easing.exp),
  EXPO_OUT: Easing.out(Easing.exp),
  EXPO_INOUT: Easing.inOut(Easing.exp),
  
  // ─── CIRCULAR ───
  CIRC_IN: Easing.in(Easing.circle),
  CIRC_OUT: Easing.out(Easing.circle),
  CIRC_INOUT: Easing.inOut(Easing.circle),
  
  // ─── SINE (SMOOTH) ───
  SINE_IN: Easing.in(Easing.sin),
  SINE_OUT: Easing.out(Easing.sin),
  SINE_INOUT: Easing.inOut(Easing.sin),
  
  // ─── BACK (OVERSHOOT) ───
  BACK_IN: Easing.in(Easing.back(1.7)),
  BACK_OUT: Easing.out(Easing.back(1.7)),
  BACK_INOUT: Easing.inOut(Easing.back(1.7)),
  BACK_OUT_STRONG: Easing.out(Easing.back(3)),
  BACK_OUT_EXTREME: Easing.out(Easing.back(5)),
  
  // ─── ELASTIC ───
  ELASTIC_IN: Easing.in(Easing.elastic(1)),
  ELASTIC_OUT: Easing.out(Easing.elastic(1)),
  ELASTIC_INOUT: Easing.inOut(Easing.elastic(1)),
  ELASTIC_SOFT: Easing.out(Easing.elastic(0.5)),
  ELASTIC_HARD: Easing.out(Easing.elastic(2)),
  
  // ─── BOUNCE ───
  BOUNCE_IN: Easing.in(Easing.bounce),
  BOUNCE_OUT: Easing.out(Easing.bounce),
  BOUNCE_INOUT: Easing.inOut(Easing.bounce),
  
  // ─── CINEMATIC (CUSTOM BEZIERS) ───
  // Smooth cinematic entrance
  CINEMATIC_IN: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  // Dramatic departure
  CINEMATIC_OUT: Easing.bezier(0.55, 0.085, 0.68, 0.53),
  // Film-quality ease
  CINEMATIC_INOUT: Easing.bezier(0.77, 0, 0.175, 1),
  // Apple-style motion
  APPLE: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  // Google Material Design
  MATERIAL: Easing.bezier(0.4, 0.0, 0.2, 1),
  // Dramatic arrival
  DRAMATIC_ARRIVE: Easing.bezier(0.19, 1, 0.22, 1),
  // Impact landing
  IMPACT: Easing.bezier(0.7, 0, 0.84, 0),
  
  // ─── UI SPECIFIC ───
  UI_PRESS: Easing.bezier(0.34, 1.56, 0.64, 1),
  UI_MODAL: Easing.bezier(0.16, 1, 0.3, 1),
  UI_TOAST: Easing.bezier(0.68, -0.6, 0.32, 1.6),
  UI_DROPDOWN: Easing.bezier(0.4, 0, 0.2, 1),
  
  // ─── TEXT SPECIFIC ───
  TEXT_REVEAL: Easing.bezier(0.22, 1, 0.36, 1),
  TEXT_EXIT: Easing.bezier(0.55, 0.085, 0.68, 0.53),
  TYPEWRITER: (t: number) => t, // Linear for typewriter
  
  // ─── LINEAR ───
  LINEAR: (t: number) => t,
} as const;

export type EasingName = keyof typeof EASING;

// ═══════════════════════════════════════════════════════════════
// EASING HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get easing function by name
 */
export const getEasing = (name: EasingName): ((t: number) => number) => {
  return EASING[name];
};

/**
 * Create custom bezier easing
 */
export const customBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): ((t: number) => number) => {
  return Easing.bezier(x1, y1, x2, y2);
};

/**
 * Chain multiple easings (for complex motion)
 */
export const chainEasings = (
  easings: Array<{ easing: (t: number) => number; weight: number }>
): ((t: number) => number) => {
  const totalWeight = easings.reduce((sum, e) => sum + e.weight, 0);
  
  return (t: number) => {
    let cumWeight = 0;
    for (const { easing, weight } of easings) {
      const normalizedWeight = weight / totalWeight;
      if (t <= cumWeight + normalizedWeight) {
        const localT = (t - cumWeight) / normalizedWeight;
        return easing(localT) * normalizedWeight + cumWeight;
      }
      cumWeight += normalizedWeight;
    }
    return 1;
  };
};
