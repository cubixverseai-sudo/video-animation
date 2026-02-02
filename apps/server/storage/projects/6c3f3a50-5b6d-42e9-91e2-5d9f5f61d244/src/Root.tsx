import { Composition } from 'remotion';
import { AutoblogScene } from './templates/AutoblogScene';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="AutoblogPromo"
				component={AutoblogScene}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
