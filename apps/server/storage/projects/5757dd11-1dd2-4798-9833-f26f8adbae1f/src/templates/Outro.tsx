import React from 'react';
import { interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLOR_2, FONT_FAMILY } from './Constants';

export const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 20], [0, 1]);

	const logoPath = staticFile('assets/5757dd11-1dd2-4798-9833-f26f8adbae1f/images/storia-logo-white.png');

	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'transparent',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily: FONT_FAMILY,
				color: COLOR_2,
			}}
		>
			<Img
				src={logoPath}
				style={{
					width: 300,
					height: 'auto',
					opacity,
					marginBottom: 40,
				}}
			/>
			<h2
				style={{
					fontSize: 36,
					fontWeight: 300,
					opacity,
					letterSpacing: 4,
					textTransform: 'uppercase',
				}}
			>
				Elevate Your Workflow
			</h2>
		</div>
	);
};
