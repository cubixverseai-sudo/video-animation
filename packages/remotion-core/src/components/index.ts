/**
 * 🎬 DIRECTOR AGENT COMPONENT LIBRARY
 * Professional Motion Graphics & Kinetic Typography System
 * 
 * This library provides everything needed to create high-quality
 * cinematic motion graphics videos.
 */

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

export * from './utils';

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY - Kinetic text animations
// ═══════════════════════════════════════════════════════════════

export * from './typography';

// ═══════════════════════════════════════════════════════════════
// EFFECTS - VFX and post-processing
// ═══════════════════════════════════════════════════════════════

export * from './effects';

// ═══════════════════════════════════════════════════════════════
// BACKGROUNDS - Dynamic backgrounds
// ═══════════════════════════════════════════════════════════════

export * from './backgrounds';

// ═══════════════════════════════════════════════════════════════
// CAMERA - Virtual camera and parallax
// ═══════════════════════════════════════════════════════════════

export * from './camera';

// ═══════════════════════════════════════════════════════════════
// TRANSITIONS - Scene transitions
// ═══════════════════════════════════════════════════════════════

export {
  GlitchTransition,
  MaskReveal,
  ZoomTransition,
  SlideTransition,
  type GlitchTransitionProps,
  type MaskRevealProps,
  type MaskShape,
  type ZoomTransitionProps,
  type SlideTransitionProps,
} from './transitions';

// ═══════════════════════════════════════════════════════════════
// COMPOSITION - Master wrappers
// ═══════════════════════════════════════════════════════════════

export * from './composition';
