import React from 'react';
import {
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	Img,
	staticFile,
	spring,
} from 'remotion';
import { COLOR_2, FONT_FAMILY } from './Constants';

interface Props {
	imagePath: string;
	title: string;
	subtitle: string;
}

export const DashboardScene: React.FC<Props> = ({ imagePath, title, subtitle }) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	const moveUp = spring({
		frame,
		fps,
		config: {
			damping: 15,
		},
	});

	const imageOpacity = interpolate(frame, [0, 15], [0, 1]);
	const imageScale = interpolate(frame, [0, 100], [1.1, 1], {
		extrapolateRight: 'clamp',
	});

	const textOpacity = interpolate(frame, [15, 30], [0, 1], {
		extrapolateLeft: 'clamp',
	});

	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'transparent',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 60,
				fontFamily: FONT_FAMILY,
				color: COLOR_2,
			}}
		>
			<div
				style={{
					width: '100%',
					boxShadow: '0 30px 100px rgba(59, 130, 246, 0.2)',
					borderRadius: 20,
					overflow: 'hidden',
					boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
					opacity: imageOpacity,
					transform: `scale(${imageScale}) translateY(${interpolate(
						moveUp,
						[0, 1],
						[50, 0]
					)}px)`,
					border: '1px solid rgba(255,255,255,0.1)',
				}}
			>
				<Img
					src={staticFile(imagePath)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			</div>
			<div
				style={{
					marginTop: 40,
					textAlign: 'center',
					opacity: textOpacity,
				}}
			>
				<h1 style={{ fontSize: 48, fontWeight: 800, margin: 0 }}>{title}</h1>
				<p style={{ fontSize: 24, opacity: 0.7, marginTop: 10 }}>{subtitle}</p>
			</div>
		</div>
	);
};
