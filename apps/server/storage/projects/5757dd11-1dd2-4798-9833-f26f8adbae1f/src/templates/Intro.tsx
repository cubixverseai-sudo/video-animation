import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';
import { COLOR_2 } from './Constants';

export const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const opacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: 'clamp',
	});

	const scale = spring({
		frame,
		fps,
		config: {
			damping: 12,
		},
	});

	const logoPath = staticFile('assets/5757dd11-1dd2-4798-9833-f26f8adbae1f/images/storia-logo-white.png');

	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'transparent',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
				}}
			>
				<Img
					src={logoPath}
					style={{
						width: 400,
						height: 'auto',
					}}
				/>
			</div>
		</div>
	);
};
