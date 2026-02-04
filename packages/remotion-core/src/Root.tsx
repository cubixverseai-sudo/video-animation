import React from 'react';
import { Composition } from 'remotion';
import { CurrentComposition } from './index';
import { Main as Main_70923053 } from '@projects/70923053-093d-4a94-a518-db381134bfb9/Main';

/**
 * Root component for Remotion.
 * The Director Agent dynamically updates this file using register_composition tool.
 * Only the CURRENT project is imported to prevent old broken projects from blocking compilation.
 */
export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Default placeholder composition - shows current preview */}
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={240}
                fps={30}
                width={1920}
                height={1080}
            />
            {/* Current project composition */}
            <Composition
                id="70923053-093d-4a94-a518-db381134bfb9:Main"
                component={Main_70923053}
                durationInFrames={240}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
