import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { BlackBackground } from '../components/Backgrounds';
import { LightRays, Vignette, FilmGrain } from '../components/Effects';
import { NetflixLogo } from '../components/Logo';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // A subtle zoom-in effect to add drama
  const globalScale = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 50,
    },
    from: 1,
    to: 1.1,
    durationInFrames: 180,
  });

  // Fade out the light rays as the logo appears
  const lightRaysOpacity = interpolate(frame, [80, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${globalScale})` }}>
      {/* 1. Base Background */}
      <BlackBackground />

      {/* 2. Animated Light Rays Effect */}
      <AbsoluteFill style={{ opacity: lightRaysOpacity }}>
        <LightRays count={50} />
      </AbsoluteFill>

      {/* 3. The main Logo Animation */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <NetflixLogo />
      </AbsoluteFill>

      {/* 4. Cinematic Overlays */}
      <Vignette intensity={0.8} />
      <FilmGrain intensity={0.07} />
    </AbsoluteFill>
  );
};
