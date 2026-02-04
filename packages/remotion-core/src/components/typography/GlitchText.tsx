/**
 * ⚡ GLITCH TEXT
 * Cyberpunk-style glitch effect with RGB split and distortion
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, random, spring } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';

export interface GlitchTextProps {
  text: string;
  
  // Styling
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  
  // Glitch settings
  intensity?: number; // 0-1, how strong the glitch
  frequency?: number; // How often glitches occur (lower = more frequent)
  rgbSplit?: boolean; // Enable RGB split effect
  rgbOffset?: number; // Pixels of RGB separation
  scanlines?: boolean;
  noise?: boolean;
  
  // Animation
  delay?: number;
  entranceGlitch?: boolean; // Glitch during entrance
  entranceDuration?: number; // Frames of entrance glitch
  continuousGlitch?: boolean; // Keep glitching after entrance
  springPreset?: SpringPresetName;
  
  style?: React.CSSProperties;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  fontSize = 80,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 900,
  color = '#ffffff',
  intensity = 0.8,
  frequency = 10,
  rgbSplit = true,
  rgbOffset = 4,
  scanlines = true,
  noise = true,
  delay = 0,
  entranceGlitch = true,
  entranceDuration = 15,
  continuousGlitch = false,
  springPreset = 'SNAPPY',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const adjustedFrame = frame - delay;
  const isInEntrance = entranceGlitch && adjustedFrame >= 0 && adjustedFrame < entranceDuration;
  const isGlitching = isInEntrance || (continuousGlitch && adjustedFrame >= 0);
  
  // Entrance animation
  const springConfig = SPRING_PRESETS[springPreset];
  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: springConfig,
  });
  
  // Random glitch values
  const glitchSeed = Math.floor(frame / frequency);
  const shouldGlitch = isGlitching && random(`glitch-trigger-${glitchSeed}`) > (1 - intensity);
  
  // Glitch offsets
  const offsetX = shouldGlitch 
    ? (random(`offset-x-${glitchSeed}`) - 0.5) * 20 * intensity 
    : 0;
  const offsetY = shouldGlitch 
    ? (random(`offset-y-${glitchSeed}`) - 0.5) * 10 * intensity 
    : 0;
  const skewX = shouldGlitch 
    ? (random(`skew-${glitchSeed}`) - 0.5) * 10 * intensity 
    : 0;
  
  // RGB split offsets
  const redOffset = shouldGlitch && rgbSplit ? rgbOffset : 0;
  const blueOffset = shouldGlitch && rgbSplit ? -rgbOffset : 0;
  
  // Clip glitch (random slice of text hidden)
  const clipTop = shouldGlitch 
    ? random(`clip-top-${glitchSeed}`) * 100 
    : 0;
  const clipBottom = shouldGlitch 
    ? clipTop + 5 + random(`clip-height-${glitchSeed}`) * 20 
    : 100;
  
  // Entrance opacity
  const opacity = interpolate(
    progress,
    [0, 0.5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    fontSize,
    fontFamily,
    fontWeight,
    color,
    opacity,
    transform: `translate(${offsetX}px, ${offsetY}px) skewX(${skewX}deg)`,
    ...style,
  };
  
  return (
    <div style={baseStyle}>
      {/* Main text layer */}
      <span style={{ position: 'relative', zIndex: 2 }}>{text}</span>
      
      {/* Red channel (RGB split) */}
      {rgbSplit && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: redOffset,
            color: 'cyan',
            mixBlendMode: 'multiply',
            opacity: shouldGlitch ? 0.8 : 0,
            zIndex: 1,
          }}
        >
          {text}
        </span>
      )}
      
      {/* Blue channel (RGB split) */}
      {rgbSplit && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: blueOffset,
            color: 'red',
            mixBlendMode: 'multiply',
            opacity: shouldGlitch ? 0.8 : 0,
            zIndex: 1,
          }}
        >
          {text}
        </span>
      )}
      
      {/* Scanlines overlay */}
      {scanlines && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.1) 2px,
              rgba(0, 0, 0, 0.1) 4px
            )`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      )}
      
      {/* Clip glitch overlay */}
      {shouldGlitch && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: offsetX * 2,
            color,
            clipPath: `inset(${clipTop}% 0 ${100 - clipBottom}% 0)`,
            zIndex: 4,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DIGITAL GLITCH (More subtle, tech-style)
// ═══════════════════════════════════════════════════════════════

export interface DigitalGlitchTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  glitchColor?: string;
  frequency?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export const DigitalGlitchText: React.FC<DigitalGlitchTextProps> = ({
  text,
  fontSize = 60,
  fontFamily = "'JetBrains Mono', monospace",
  fontWeight = 700,
  color = '#00ff88',
  glitchColor = '#ff0066',
  frequency = 20,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;
  
  const glitchSeed = Math.floor(adjustedFrame / frequency);
  const shouldGlitch = random(`digital-${glitchSeed}`) > 0.7;
  
  // Random character replacement
  const glitchedText = shouldGlitch
    ? text.split('').map((char, i) => 
        random(`char-${glitchSeed}-${i}`) > 0.8 
          ? String.fromCharCode(33 + Math.floor(random(`code-${glitchSeed}-${i}`) * 94))
          : char
      ).join('')
    : text;
  
  const flicker = shouldGlitch && random(`flicker-${glitchSeed}`) > 0.5;
  
  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color: flicker ? glitchColor : color,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        opacity: flicker ? 0.8 : 1,
        ...style,
      }}
    >
      {glitchedText}
    </div>
  );
};

export default GlitchText;
