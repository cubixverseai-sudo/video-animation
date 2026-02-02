'use client';

import { Player } from '@remotion/player';
import { CurrentComposition, currentProps } from '@director/remotion';
import { useParams } from 'next/navigation';

export default function IsolatedPreview() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
            <Player
                component={CurrentComposition}
                durationInFrames={300}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                controls
                inputProps={currentProps}
                acknowledgeRemotionLicense
            />
        </div>
    );
}
