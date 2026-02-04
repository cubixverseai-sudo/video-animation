/**
 * ⌨️ TYPEWRITER TEXT
 * Professional typewriter effect using string slicing (not per-char opacity)
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_PRESETS, SpringPresetName } from '../utils/springs';
import { createGlow, createTextShadow } from '../utils/colors';

export interface TypewriterTextProps {
  text: string;
  
  // Styling
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  
  // Animation
  charsPerSecond?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  cursorColor?: string;
  cursorBlink?: boolean;
  
  // Effects
  glow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  
  // Advanced
  startFrom?: number; // Start with some chars already visible
  endAt?: number; // Stop at certain char count
  
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize = 48,
  fontFamily = "'JetBrains Mono', 'Fira Code', monospace",
  fontWeight = 500,
  color = '#ffffff',
  charsPerSecond = 15,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  cursorColor,
  cursorBlink = true,
  glow = false,
  glowColor,
  glowIntensity = 0.8,
  startFrom = 0,
  endAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate visible characters
  const adjustedFrame = Math.max(0, frame - delay);
  const charsVisible = startFrom + Math.floor((adjustedFrame / fps) * charsPerSecond);
  const finalCharCount = endAt !== undefined ? Math.min(charsVisible, endAt) : charsVisible;
  const displayText = text.slice(0, Math.min(finalCharCount, text.length));
  
  // Is typing complete?
  const isComplete = displayText.length >= text.length;
  
  // Cursor blink
  const cursorOpacity = cursorBlink && isComplete
    ? Math.floor(frame / 15) % 2 === 0 ? 1 : 0
    : 1;
  
  // Show cursor only while typing or if blinking is enabled
  const showCursor = cursor && (!isComplete || cursorBlink);
  
  // Glow effect
  const glowEffect = glow ? createGlow(glowColor || color, glowIntensity) : '';
  const shadowEffect = createTextShadow(color, 6);
  
  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        textShadow: [glowEffect, shadowEffect].filter(Boolean).join(', ') || 'none',
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      <span>{displayText}</span>
      {showCursor && (
        <span
          style={{
            color: cursorColor || color,
            opacity: cursorOpacity,
            marginLeft: 2,
          }}
        >
          {cursorChar}
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TYPEWRITER WITH DELETION (Type → Pause → Delete → Type new)
// ═══════════════════════════════════════════════════════════════

export interface TypewriterCycleProps extends Omit<TypewriterTextProps, 'text'> {
  texts: string[];
  typeDuration?: number; // Frames to type each text
  pauseDuration?: number; // Frames to pause before deleting
  deleteDuration?: number; // Frames to delete
  loop?: boolean;
}

export const TypewriterCycle: React.FC<TypewriterCycleProps> = ({
  texts,
  typeDuration = 60,
  pauseDuration = 30,
  deleteDuration = 30,
  loop = true,
  ...props
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const cycleLength = typeDuration + pauseDuration + deleteDuration;
  const totalLength = cycleLength * texts.length;
  
  const adjustedFrame = loop ? frame % totalLength : Math.min(frame, totalLength - 1);
  const currentTextIndex = Math.floor(adjustedFrame / cycleLength);
  const frameInCycle = adjustedFrame % cycleLength;
  
  const currentText = texts[currentTextIndex] || texts[texts.length - 1];
  
  // Calculate visible characters based on phase
  let visibleChars: number;
  
  if (frameInCycle < typeDuration) {
    // Typing phase
    const typeProgress = frameInCycle / typeDuration;
    visibleChars = Math.floor(typeProgress * currentText.length);
  } else if (frameInCycle < typeDuration + pauseDuration) {
    // Pause phase - show full text
    visibleChars = currentText.length;
  } else {
    // Deleting phase
    const deleteProgress = (frameInCycle - typeDuration - pauseDuration) / deleteDuration;
    visibleChars = Math.floor((1 - deleteProgress) * currentText.length);
  }
  
  const displayText = currentText.slice(0, visibleChars);
  const isComplete = frameInCycle >= typeDuration && frameInCycle < typeDuration + pauseDuration;
  
  return (
    <TypewriterText
      {...props}
      text={displayText}
      cursor={true}
      cursorBlink={isComplete}
      charsPerSecond={1000} // We're manually controlling chars
    />
  );
};

export default TypewriterText;
