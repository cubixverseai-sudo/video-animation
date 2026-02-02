import {
	AbsoluteFill,
	Img,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	staticFile,
	Audio,
	random,
	Sequence,
} from 'remotion';
import React from 'react';

// --- Assets ---
const bgMusic = staticFile('assets/6c3f3a50-5b6d-42e9-91e2-5d9f5f61d244/audio/tech-bg-1.mp3');
const whooshSfx = staticFile('assets/6c3f3a50-5b6d-42e9-91e2-5d9f5f61d244/audio/whoosh-1.mp3');
const logoImg = staticFile('assets/6c3f3a50-5b6d-42e9-91e2-5d9f5f61d244/images/logok.png');

// --- Colors (Refined from Logo Analysis) ---
const COLORS = {
	bg: '#050511', // Deepest Navy/Black
	primary: '#7c3aed', // Vivid Purple
	accent: '#06b6d4', // Cyan
	text: '#f8fafc',
	grid: '#1e293b',
};

// --- Components ---

const CircuitBackground: React.FC = () => {
	const frame = useCurrentFrame();

	// Slow parallax movement
	const translateY = interpolate(frame, [0, 300], [0, -50]);
	
	// Random flickering nodes
	const nodes = new Array(20).fill(0).map((_, i) => {
		const seed = i * 123;
		const x = random(seed) * 100;
		const y = random(seed + 1) * 100;
		const size = random(seed + 2) * 3 + 2;
		const flickerSpeed = random(seed + 3) * 5 + 2;
		const opacity = (Math.sin(frame / flickerSpeed) + 1) / 2 * 0.5 + 0.2;
		
		return (
			<div
				key={i}
				style={{
					position: 'absolute',
					left: `${x}%`,
					top: `${y}%`,
					width: size,
					height: size,
					backgroundColor: i % 2 === 0 ? COLORS.primary : COLORS.accent,
					borderRadius: '50%',
					opacity,
					boxShadow: `0 0 ${size * 2}px ${i % 2 === 0 ? COLORS.primary : COLORS.accent}`,
				}}
			/>
		);
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				overflow: 'hidden',
				zIndex: 0,
			}}
		>
			{/* Grid Lines */}
			<div
				style={{
					position: 'absolute',
					width: '200%',
					height: '200%',
					top: '-50%',
					left: '-50%',
					backgroundImage: `
                        linear-gradient(${COLORS.grid} 1px, transparent 1px),
                        linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)
                    `,
					backgroundSize: '80px 80px',
					transform: `perspective(1000px) rotateX(60deg) translateY(${translateY}px)`,
					opacity: 0.3,
				}}
			/>
			
			{/* Glowing Nodes */}
			<div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
				{nodes}
			</div>

			{/* Vignette */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(circle at center, transparent 20%, #050511 90%)',
				}}
			/>
		</AbsoluteFill>
	);
};

const Scanlines: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1))',
				backgroundSize: '100% 4px',
				pointerEvents: 'none',
				zIndex: 20,
				opacity: 0.1,
			}}
		/>
	);
};

const LogoReveal: React.FC<{ startFrame: number }> = ({ startFrame }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const activeFrame = frame - startFrame;
	
	const scale = spring({
		frame: activeFrame,
		fps,
		from: 0.5,
		to: 1,
		config: { damping: 12, stiffness: 100, mass: 0.8 },
	});

	const rotate = spring({
		frame: activeFrame,
		fps,
		from: -10,
		to: 0,
		config: { damping: 20 },
	});

	const opacity = interpolate(activeFrame, [0, 10], [0, 1], {
		extrapolateRight: 'clamp',
	});

	const glowIntensity = interpolate(activeFrame, [10, 30, 50], [0, 30, 10], {
		extrapolateRight: 'clamp',
	});

	if (frame < startFrame) return null;

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				height: '100%',
				zIndex: 10,
			}}
		>
			<div
				style={{
					transform: `scale(${scale}) rotate(${rotate}deg)`,
					opacity,
					filter: `drop-shadow(0 0 ${glowIntensity}px ${COLORS.primary}88)`,
				}}
			>
				<Img
					src={logoImg}
					style={{
						height: 280,
						objectFit: 'contain',
					}}
				/>
			</div>
		</div>
	);
};

const TextReveal: React.FC<{ startFrame: number }> = ({ startFrame }) => {
	const frame = useCurrentFrame();
	const activeFrame = frame - startFrame;

	// Slide up and fade
	const translateY = interpolate(activeFrame, [0, 25], [40, 0], {
		extrapolateRight: 'clamp',
		easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic out
	});

	const opacity = interpolate(activeFrame, [0, 15], [0, 1], {
		extrapolateRight: 'clamp',
	});

	// Subtitle typewriter effect (simple version)
	const subOpacity = interpolate(activeFrame, [20, 35], [0, 1], {
		extrapolateRight: 'clamp',
	});
	
	if (frame < startFrame) return null;

	return (
		<div
			style={{
				position: 'absolute',
				top: '68%', // Below logo
				width: '100%',
				textAlign: 'center',
				zIndex: 10,
			}}
		>
			<h1
				style={{
					fontFamily: 'Montserrat, system-ui, sans-serif',
					fontSize: '90px',
					fontWeight: 900,
					color: COLORS.text,
					margin: 0,
					letterSpacing: '-3px',
					opacity,
					transform: `translateY(${translateY}px)`,
					background: `linear-gradient(to right, ${COLORS.text} 0%, ${COLORS.accent} 100%)`,
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					filter: `drop-shadow(0 0 20px ${COLORS.primary}44)`,
				}}
			>
				AUTOBLOG AI
			</h1>
			<div style={{ opacity: subOpacity, marginTop: '15px' }}>
				<span
					style={{
						fontFamily: 'monospace',
						fontSize: '26px',
						color: COLORS.accent,
						letterSpacing: '8px',
						textTransform: 'uppercase',
						borderRight: '2px solid ' + COLORS.accent,
						paddingRight: '10px',
						display: 'inline-block',
					}}
				>
					Automated Creativity
				</span>
			</div>
		</div>
	);
};

export const AutoblogScene: React.FC = () => {
	return (
		<AbsoluteFill>
			{/* Audio */}
			<Audio src={bgMusic} volume={0.6} />
			
			<Sequence from={25}>
				<Audio src={whooshSfx} volume={0.7} />
			</Sequence>

			{/* Visuals */}
			<CircuitBackground />
			<Scanlines />
			<LogoReveal startFrame={30} />
			<TextReveal startFrame={55} />
		</AbsoluteFill>
	);
};
