import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.5) 100%)',
      }} />
      
      {/* Subtle Scanlines or Grain could go here */}
    </div>
  );
};
