import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';

// Simple Vignette Effect
export const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.7 }) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${intensity}) 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

// Film Grain Effect
export const FilmGrain: React.FC<{ intensity?: number }> = ({ intensity = 0.08 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 100; // Animate the grain pattern
  
  const grainStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: intensity,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' seed='${seed}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
  };
  
  return <div style={grainStyle} />;
};


// A single light ray component
const LightRay: React.FC<{
  seed: number;
  color: string;
}> = ({ seed, color }) => {
  const frame = useCurrentFrame();
  
  const startY = random('startY' + seed) * 100 - 50;
  const startX = random('startX' + seed) * 100 - 50;
  const angle = random('angle' + seed) * 360;
  const speed = random('speed' + seed) * 0.2 + 0.1;

  const progress = interpolate(frame, [0, 150], [0, 1]);
  const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  const x = startX + Math.sin(angle) * (1 - easedProgress) * 50;
  const y = startY + Math.cos(angle) * (1 - easedProgress) * 50;
  const opacity = interpolate(frame, [0, 30, 120, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const width = 1 + random('width' + seed) * 3;

  return (
    <div
      style={{
        position: 'absolute',
        width: `${width}px`,
        height: '150px',
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        opacity: opacity * 0.7,
        transform: `translate(${x}vw, ${y}vh) rotate(${angle + 90}deg) scaleY(${1 + speed})`,
        transformOrigin: 'center center'
      }}
    />
  );
};

// Manages a collection of light rays
export const LightRays: React.FC<{ count?: number }> = ({ count = 40 }) => {
  const colors = ['#E50914', '#B20710', '#FFFFFF', '#F5F5F1'];
  
  return (
    <AbsoluteFill style={{ filter: 'blur(5px)'}}>
      {Array.from({ length: count }).map((_, i) => {
        const colorSeed = random('color' + i);
        const color = colors[Math.floor(colorSeed * colors.length)];
        return <LightRay key={i} seed={i} color={color} />;
      })}
    </AbsoluteFill>
  );
};
