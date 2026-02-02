import { AbsoluteFill, Img, staticFile, Video, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Logo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// Animations
	const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
	const scale = interpolate(frame, [0, durationInFrames], [0.9, 1.1]);
	
	const fadeOut = interpolate(
		frame,
		[durationInFrames - 30, durationInFrames],
		[1, 0],
		{ extrapolateLeft: 'clamp' }
	);

	return (
		<AbsoluteFill style={{ backgroundColor: '#0F172A' }}>
			{/* Background Video Layer */}
			<AbsoluteFill style={{ opacity: 0.3 }}>
				<Video
					src={staticFile('assets/28d9fbe5-ceb3-49ec-8792-86b4aeb78a11/videos/background-minimal.mp4')}
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					loop
					muted
				/>
			</AbsoluteFill>

			{/* Content Layer */}
			<AbsoluteFill 
				style={{ 
					justifyContent: 'center', 
					alignItems: 'center',
					opacity: opacity * fadeOut,
					transform: `scale(${scale})`
				}}
			>
				<Img
					src={staticFile('assets/28d9fbe5-ceb3-49ec-8792-86b4aeb78a11/images/storia-logo-white.png')}
					style={{
						width: '40%',
						objectFit: 'contain',
						filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))'
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
