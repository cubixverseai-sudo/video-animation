import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CurrentComposition } from './index';
import { Main as Main_b8408f04 } from '@projects/b8408f04-fbd6-4188-b9ec-6899db62da17/Main';

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
                id="b8408f04-fbd6-4188-b9ec-6899db62da17-Main"
                component={Main_b8408f04}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};

registerRoot(RemotionRoot);
