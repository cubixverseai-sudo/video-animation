/**
 * 🎬 CINEMATIC COMPOSITION
 * Master wrapper that adds all cinematic enhancements automatically
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';

// Effects
import { FilmGrain } from '../effects/FilmGrain';
import { Vignette } from '../effects/Vignette';
import { Letterbox } from '../effects/Vignette';
import { Scanlines } from '../effects/Bloom';

// Camera
import { VirtualCamera, CameraMove } from '../camera/VirtualCamera';

// Backgrounds
import { GradientBackground } from '../backgrounds/GradientBackground';

// Utils
import { PALETTES, PaletteName } from '../utils/colors';

// ═══════════════════════════════════════════════════════════════
// CINEMATIC PRESET
// ═══════════════════════════════════════════════════════════════

export type CinematicPreset = 
  | 'film'        // Classic film look
  | 'modern'      // Clean modern
  | 'cyberpunk'   // Neon/tech
  | 'vintage'     // Retro warm
  | 'minimal'     // Clean minimal
  | 'dramatic'    // High contrast
  | 'custom';     // Use custom settings

const CINEMATIC_PRESETS: Record<Exclude<CinematicPreset, 'custom'>, {
  grain: number;
  vignette: number;
  letterbox: boolean;
  aspectRatio: number;
  scanlines: boolean;
  colorPalette: PaletteName;
}> = {
  film: {
    grain: 0.15,
    vignette: 0.5,
    letterbox: true,
    aspectRatio: 2.39,
    scanlines: false,
    colorPalette: 'DARK',
  },
  modern: {
    grain: 0.08,
    vignette: 0.3,
    letterbox: false,
    aspectRatio: 1.78,
    scanlines: false,
    colorPalette: 'DARK',
  },
  cyberpunk: {
    grain: 0.12,
    vignette: 0.4,
    letterbox: true,
    aspectRatio: 2.0,
    scanlines: true,
    colorPalette: 'TECH',
  },
  vintage: {
    grain: 0.25,
    vignette: 0.6,
    letterbox: false,
    aspectRatio: 1.78,
    scanlines: false,
    colorPalette: 'WARM',
  },
  minimal: {
    grain: 0.05,
    vignette: 0.2,
    letterbox: false,
    aspectRatio: 1.78,
    scanlines: false,
    colorPalette: 'CLEAN',
  },
  dramatic: {
    grain: 0.18,
    vignette: 0.7,
    letterbox: true,
    aspectRatio: 2.39,
    scanlines: false,
    colorPalette: 'DARK',
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

export interface CinematicCompositionProps {
  children: React.ReactNode;
  
  /** Use a preset or custom */
  preset?: CinematicPreset;
  
  /** Background color */
  backgroundColor?: string;
  
  /** Film grain intensity (0-1) */
  grain?: number;
  /** Animated grain */
  animatedGrain?: boolean;
  
  /** Vignette intensity (0-1) */
  vignette?: number;
  
  /** Enable cinematic letterbox */
  letterbox?: boolean;
  /** Letterbox aspect ratio */
  aspectRatio?: number;
  
  /** Enable scanlines (retro effect) */
  scanlines?: boolean;
  /** Scanline opacity */
  scanlineOpacity?: number;
  
  /** Camera movements */
  cameraMoves?: CameraMove[];
  /** Enable ambient camera drift */
  cameraAmbientDrift?: boolean;
  
  /** Color palette */
  colorPalette?: PaletteName;
  
  /** Enable gradient background */
  gradientBackground?: boolean;
  
  /** Show safe area guides (debug) */
  showSafeAreas?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const CinematicComposition: React.FC<CinematicCompositionProps> = ({
  children,
  preset = 'modern',
  backgroundColor,
  grain: customGrain,
  animatedGrain = true,
  vignette: customVignette,
  letterbox: customLetterbox,
  aspectRatio: customAspectRatio,
  scanlines: customScanlines,
  scanlineOpacity = 0.1,
  cameraMoves = [],
  cameraAmbientDrift = true,
  colorPalette: customPalette,
  gradientBackground = true,
  showSafeAreas = false,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  
  // Get preset values
  const presetConfig = preset !== 'custom' ? CINEMATIC_PRESETS[preset] : null;
  
  // Merge preset with custom values
  const grain = customGrain ?? presetConfig?.grain ?? 0.1;
  const vignette = customVignette ?? presetConfig?.vignette ?? 0.4;
  const letterbox = customLetterbox ?? presetConfig?.letterbox ?? false;
  const aspectRatio = customAspectRatio ?? presetConfig?.aspectRatio ?? 2.39;
  const scanlines = customScanlines ?? presetConfig?.scanlines ?? false;
  const colorPalette = customPalette ?? presetConfig?.colorPalette ?? 'DARK';
  
  const palette = PALETTES[colorPalette];
  const bgColor = backgroundColor ?? palette.bg.primary;
  
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Background gradient */}
      {gradientBackground && (
        <GradientBackground
          type="radial"
          colors={[palette.bg.secondary, palette.bg.primary]}
          positionX={50}
          positionY={50}
        />
      )}
      
      {/* Camera wrapper */}
      <VirtualCamera
        moves={cameraMoves}
        ambientDrift={cameraAmbientDrift}
        driftIntensity={0.01}
        driftSpeed={0.015}
      >
        {children}
      </VirtualCamera>
      
      {/* VFX Layers (on top) */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {/* Vignette */}
        {vignette > 0 && (
          <Vignette
            intensity={vignette}
            size={0.4}
            softness={0.5}
          />
        )}
        
        {/* Film grain */}
        {grain > 0 && (
          <FilmGrain
            intensity={grain}
            animated={animatedGrain}
            blendMode="overlay"
          />
        )}
        
        {/* Scanlines */}
        {scanlines && (
          <Scanlines
            opacity={scanlineOpacity}
            animated={true}
          />
        )}
        
        {/* Letterbox */}
        {letterbox && (
          <Letterbox
            aspectRatio={aspectRatio}
            animated={true}
            delay={0}
            duration={30}
          />
        )}
        
        {/* Safe area guides (debug) */}
        {showSafeAreas && (
          <AbsoluteFill>
            {/* Title safe (10%) */}
            <div
              style={{
                position: 'absolute',
                top: height * 0.1,
                left: width * 0.1,
                right: width * 0.1,
                bottom: height * 0.1,
                border: '1px dashed rgba(255,255,0,0.5)',
                pointerEvents: 'none',
              }}
            />
            {/* Action safe (5%) */}
            <div
              style={{
                position: 'absolute',
                top: height * 0.05,
                left: width * 0.05,
                right: width * 0.05,
                bottom: height * 0.05,
                border: '1px dashed rgba(255,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
            {/* Center crosshair */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 20,
                height: 1,
                backgroundColor: 'rgba(0,255,0,0.5)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 1,
                height: 20,
                backgroundColor: 'rgba(0,255,0,0.5)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default CinematicComposition;
