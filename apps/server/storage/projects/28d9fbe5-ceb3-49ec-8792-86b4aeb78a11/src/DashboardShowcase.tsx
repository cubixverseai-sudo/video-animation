import { Series, AbsoluteFill, Audio, staticFile } from 'remotion';
import { Logo } from './components/Logo';
import { DashboardSlide } from './components/DashboardSlide';

export const DashboardShowcase: React.FC = () => {
	const audioPath = (name: string) => staticFile(`assets/28d9fbe5-ceb3-49ec-8792-86b4aeb78a11/audio/${name}`);

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			{/* Background Music */}
			<Audio src={audioPath('tech-bg.mp3')} volume={0.4} loop />

			<Series>
				<Series.Sequence durationInFrames={90}>
					<Audio src={audioPath('whoosh.mp3')} startFrom={0} />
					<Logo />
				</Series.Sequence>

				<Series.Sequence durationInFrames={120}>
					<Audio src={audioPath('whoosh.mp3')} startFrom={0} />
					<DashboardSlide
						imagePath="assets/28d9fbe5-ceb3-49ec-8792-86b4aeb78a11/images/step-4.jpeg"
					/>
				</Series.Sequence>

				<Series.Sequence durationInFrames={120}>
					<Audio src={audioPath('whoosh.mp3')} startFrom={0} />
					<DashboardSlide
						imagePath="assets/28d9fbe5-ceb3-49ec-8792-86b4aeb78a11/images/step-7.jpeg"
					/>
				</Series.Sequence>

				<Series.Sequence durationInFrames={90}>
					<Audio src={audioPath('whoosh.mp3')} startFrom={0} />
					<Logo />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
