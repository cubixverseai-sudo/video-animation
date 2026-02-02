import React from 'react';
import { Composition } from 'remotion';
import { CurrentComposition } from './index';

/**
 * Root component for Remotion.
 * The Director Agent will dynamically add compositions here.
 */
export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Default placeholder composition */}
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={150}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
