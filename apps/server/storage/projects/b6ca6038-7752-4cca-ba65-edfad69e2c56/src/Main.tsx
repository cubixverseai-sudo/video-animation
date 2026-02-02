import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Series, spring, useVideoConfig, Easing } from 'remotion';
import { Background } from './components/Background';
import { Logo } from './components/Logo';

const TextReveal: React.FC<{ text: string; delay: number; fontSize?: number; fontWeight?: string | number }> = ({ 
	text, 
	delay, 
	fontSize = 80, 
	fontWeight = 900 
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	
	const chars = text.split('');
	
	return (
		<div style={{ 
			display: 'flex', 
			justifyContent: 'center', 
			fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
			letterSpacing: '-0.02em',
		}}>
			{chars.map((char, i) => {
				const charSpring = spring({
					frame: frame - delay - i * 2,
					fps,
					config: { damping: 15, stiffness: 100 },
				});
				
				const opacity = interpolate(charSpring, [0, 1], [0, 1]);
				const translateY = interpolate(charSpring, [0, 1], [20, 0]);
				const blur = interpolate(charSpring, [0, 1], [10, 0]);
				
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity,
							transform: `translateY(${translateY}px)`,
							filter: `blur(${blur}px)`,
							color: 'white',
							fontSize,
							fontWeight,
							whiteSpace: char === ' ' ? 'pre' : 'normal',
							textShadow: '0 10px 30px rgba(0,0,0,0.3)',
						}}
					>
						{char}
					</span>
				);
			})}
		</div>
	);
};

const Subtitle: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - delay, [0, 30], [0, 1], { extrapolateLeft: 'clamp' });
	const tracking = interpolate(frame - delay, [0, 60], [10, 2], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

	return (
		<div style={{
			opacity,
			color: '#ffd700',
			fontSize: 24,
			fontWeight: 400,
			letterSpacing: `${tracking}px`,
			textTransform: 'uppercase',
			marginTop: 20,
			textAlign: 'center',
		}}>
			{text}
		</div>
	);
};

export const Main: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{ backgroundColor: '#050505' }}>
			<Background />
			
			<Series>
				{/* Scene 1: Logo Intro */}
				<Series.Sequence durationInFrames={120}>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Logo />
					</AbsoluteFill>
				</Series.Sequence>

				{/* Scene 2: Brand Tagline */}
				<Series.Sequence durationInFrames={150}>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						<div style={{ transform: 'scale(0.8)', opacity: 0.8, filter: 'blur(2px)' }}>
							<Logo />
						</div>
						<div style={{ position: 'absolute', bottom: '20%', width: '100%' }}>
							<TextReveal text="PREMIUM QUALITY" delay={30} fontSize={60} />
							<Subtitle text="Innovation & Excellence" delay={60} />
						</div>
					</AbsoluteFill>
				</Series.Sequence>

				{/* Scene 3: Feature Callout */}
				<Series.Sequence durationInFrames={120}>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						<div style={{ 
							padding: '60px 100px', 
							border: '1px solid rgba(255,215,0,0.3)', 
							background: 'rgba(0,0,0,0.4)',
							backdropFilter: 'blur(20px)',
							borderRadius: '20px'
						}}>
							<TextReveal text="MODERN DESIGN" delay={10} fontSize={70} />
							<Subtitle text="Crafted with precision" delay={40} />
						</div>
					</AbsoluteFill>
				</Series.Sequence>

				{/* Final Scene: Outro */}
				<Series.Sequence durationInFrames={150}>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Logo />
						<div style={{ position: 'absolute', bottom: '15%' }}>
							<TextReveal text="CONTACT US" delay={20} fontSize={50} />
							<div style={{ 
								color: 'white', 
								fontSize: 24, 
								textAlign: 'center', 
								marginTop: 10,
								opacity: interpolate(frame % 150, [50, 80], [0, 1], { extrapolateLeft: 'clamp' })
							}}>
								www.yourwebsite.com
							</div>
						</div>
					</AbsoluteFill>
				</Series.Sequence>
			</Series>

			{/* Overall Flash Effect for transitions */}
			<AbsoluteFill 
				style={{ 
					backgroundColor: 'white', 
					opacity: interpolate(frame % 120, [0, 5, 15], [0, 0.2, 0]),
					pointerEvents: 'none'
				}} 
			/>

			{/* Final Fade to Black */}
			<AbsoluteFill 
				style={{ 
					backgroundColor: 'black', 
					opacity: interpolate(frame, [510, 540], [0, 1], { extrapolateLeft: 'clamp' }),
					pointerEvents: 'none'
				}} 
			/>
		</AbsoluteFill>
	);
};
