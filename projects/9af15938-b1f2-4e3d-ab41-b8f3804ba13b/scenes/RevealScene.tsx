import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BlackBackground } from '../components/Backgrounds';
import { LogoText } from '../components/TextAnimations';

export const RevealScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <BlackBackground />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <LogoText text="NETFLIX" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
