import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CurrentComposition } from './index';
import { Main as Main_4596776b } from '@projects/4596776b-2376-427b-9066-cf0902f5b501/Main';

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
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
            />
            {/* Current project composition */}
            <Composition
                id="4596776b-2376-427b-9066-cf0902f5b501-Main"
                component={Main_4596776b}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};

registerRoot(RemotionRoot);
