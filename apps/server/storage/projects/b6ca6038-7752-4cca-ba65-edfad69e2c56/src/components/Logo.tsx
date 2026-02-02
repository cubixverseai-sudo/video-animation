import React from 'react';
import {
	Img,
	staticFile,
	interpolate,
	useCurrentFrame,
	spring,
	useVideoConfig,
	AbsoluteFill,
	Easing,
} from 'remotion';

export const Logo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const entrance = spring({
		frame,
		fps,
		config: {
			damping: 20,
			stiffness: 60,
		},
	});

	const scale = interpolate(entrance, [0, 1], [0.8, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const opacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateRight: 'clamp',
	});

	// Subtle parallax rotation
	const rotateX = interpolate(Math.sin(frame / 60), [-1, 1], [-5, 5]);
	const rotateY = interpolate(Math.cos(frame / 60), [-1, 1], [-5, 5]);

	const logoPath = staticFile(`assets/b6ca6038-7752-4cca-ba65-edfad69e2c56/images/Logo-Animation.jpeg`);

	// Lighting effects
	const shineProgress = interpolate(frame % 150, [40, 90], [-100, 200], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				perspective: '1000px',
			}}
		>
			<div
				style={{
					transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
					opacity,
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{/* Intense Background Glow */}
				<div style={{
					position: 'absolute',
					width: 500,
					height: 500,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
					filter: 'blur(50px)',
					opacity: interpolate(Math.sin(frame / 30), [-1, 1], [0.5, 1]),
				}} />

				{/* Logo Frame */}
				<div style={{
					width: 420,
					height: 420,
					borderRadius: '60px',
					padding: '10px',
					background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
					boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
					position: 'relative',
					overflow: 'hidden',
				}}>
					<div style={{
						width: '100%',
						height: '100%',
						borderRadius: '50px',
						overflow: 'hidden',
						position: 'relative',
						backgroundColor: '#111',
					}}>
						<Img
							src={logoPath}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
						
						{/* Sweep Shine */}
						<div style={{
							position: 'absolute',
							top: 0,
							left: `${shineProgress}%`,
							width: '60%',
							height: '100%',
							background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
							transform: 'skewX(-25deg)',
							pointerEvents: 'none',
						}} />
					</div>
				</div>

				{/* Floating Geometric Accents */}
				<svg
					width="550"
					height="550"
					style={{
						position: 'absolute',
						pointerEvents: 'none',
					}}
				>
					<circle
						cx="275"
						cy="275"
						r="260"
						fill="none"
						stroke="rgba(255, 215, 0, 0.3)"
						strokeWidth="1"
						strokeDasharray="5 15"
						style={{
							transformOrigin: 'center',
							transform: `rotate(${frame / 2}deg)`,
						}}
					/>
					<circle
						cx="275"
						cy="275"
						r="245"
						fill="none"
						stroke="white"
						strokeWidth="0.5"
						opacity="0.2"
					/>
				</svg>
			</div>
		</AbsoluteFill>
	);
};
