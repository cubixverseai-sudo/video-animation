import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const particles = useMemo(() => {
		return Array.from({ length: 60 }).map((_, i) => ({
			x: Math.random() * width,
			y: Math.random() * height,
			size: Math.random() * 3 + 1,
			speedX: (Math.random() - 0.5) * 0.3,
			speedY: (Math.random() - 0.5) * 0.3,
			opacity: Math.random() * 0.4 + 0.1,
			color: Math.random() > 0.8 ? '#ffd700' : '#ffffff',
		}));
	}, [width, height]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#050505' }}>
			{/* Deep Background Gradient */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					background: `radial-gradient(circle at center, #151515 0%, #050505 100%)`,
				}}
			/>

			{/* Floating Dust Particles */}
			{particles.map((p, i) => {
				const x = (p.x + p.speedX * frame) % width;
				const y = (p.y + p.speedY * frame) % height;
				
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: p.size,
							height: p.size,
							backgroundColor: p.color,
							borderRadius: '50%',
							opacity: p.opacity * (0.5 + 0.5 * Math.sin(frame / 30 + i)),
							filter: 'blur(1px)',
							boxShadow: `0 0 10px ${p.color}44`,
						}}
					/>
				);
			})}

			{/* Cinematic Vignette */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Moving Light Leak */}
			<div
				style={{
					position: 'absolute',
					width: '120%',
					height: '120%',
					top: '-10%',
					left: '-10%',
					background: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)',
					filter: 'blur(100px)',
					opacity: interpolate(Math.sin(frame / 100), [-1, 1], [0.3, 0.7]),
					transform: `rotate(${frame / 10}deg)`,
				}}
			/>
		</AbsoluteFill>
	);
};
