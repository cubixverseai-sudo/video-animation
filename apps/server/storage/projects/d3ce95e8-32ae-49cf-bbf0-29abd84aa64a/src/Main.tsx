import React from 'react';
import { Series } from 'remotion';
import { Intro } from './scenes/Intro';
import { DashboardScene } from './scenes/Dashboard';
import { LogoOutro } from './scenes/LogoOutro';
import { Overlays } from './components/Overlays';

export const Main: React.FC = () => {
  return (
    <>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <DashboardScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <LogoOutro />
        </Series.Sequence>
      </Series>
      <Overlays />
    </>
  );
};
