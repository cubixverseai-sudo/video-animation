import React from 'react';
import { Series, AbsoluteFill } from 'remotion';
import { Intro } from './Intro';
import { DashboardScene } from './DashboardScene';
import { Outro } from './Outro';
import { COLOR_1 } from './Constants';

export const Main: React.FC = () => {
	return (
		<AbsoluteFill style={{ 
			backgroundColor: COLOR_1,
			background: `radial-gradient(circle at center, #1a1a1a 0%, ${COLOR_1} 100%)`
		}}>
				<Series.Sequence durationInFrames={60}>
					<Intro />
				</Series.Sequence>
						title="Start Your Journey"
						subtitle="Begin with a clean, intuitive interface designed for speed."
					/>
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<DashboardScene
						imagePath="assets/5757dd11-1dd2-4798-9833-f26f8adbae1f/images/step-6.jpeg"
						title="Scale to Success"
						subtitle="Manage complex workflows with advanced professional tools."
					/>
					/>
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<DashboardScene
						imagePath="assets/5757dd11-1dd2-4798-9833-f26f8adbae1f/images/step-6.jpeg"
						title="Powerful Management"
						subtitle="Control every detail of your dashboard with ease."
					/>
				</Series.Sequence>
				<Series.Sequence durationInFrames={60}>
					<Outro />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
