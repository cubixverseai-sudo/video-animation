import React from 'react';
import { AbsoluteFill, Video, staticFile, useVideoConfig } from 'remotion';

export const GlitchTransition: React.FC = () => {
	const video = staticFile('assets/28d9fbe5-ceb3-49ec-8792-86b4aeb78a11/videos/glitch-transition.mp4');
	
	return (
		<AbsoluteFill>
			<Video 
				src={video}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					mixBlendMode: 'screen', // Good for glitches over dark backgrounds
				}}
				volume={1} // Ensure sound plays if present
			/>
		</AbsoluteFill>
	);
};