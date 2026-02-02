import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface DashboardSlideProps {
	imagePath: string;
	title?: string;
}

export const DashboardSlide: React.FC<DashboardSlideProps> = ({ imagePath, title }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Smooth entry
	const slideUp = interpolate(frame, [0, 40], [100, 0], { extrapolateRight: 'clamp' });
	const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
	
	// Continuous movement
	const scale = interpolate(frame, [0, durationInFrames], [1, 1.05]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#0F172A', overflow: 'hidden' }}>
			{/* Subtle Background Gradient */}
			<AbsoluteFill style={{
				background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
				opacity: 1
			}} />

			<AbsoluteFill style={{ 
				justifyContent: 'center', 
				alignItems: 'center',
				padding: '60px'
			}}>
				<div style={{
					borderRadius: '20px',
					overflow: 'hidden',
					boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
					transform: `translateY(${slideUp}px) scale(${scale})`,
					opacity: opacity,
					border: '1px solid rgba(255, 255, 255, 0.1)'
				}}>
					<Img
						src={staticFile(imagePath)}
						style={{
							maxWidth: '100%',
							maxHeight: '85vh',
							display: 'block'
						}}
					/>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
