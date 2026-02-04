import React from 'react';
import { Composition } from 'remotion';
import { CurrentComposition } from './index';
import { Main as Main_8658a2d4 } from '@projects/8658a2d4-5cbb-44b6-98a7-44009a1c2b51/Main';
import { Main as Main_1023debb } from '@projects/1023debb-cbbc-4153-b259-12867ffa8c71/Main';

/**
 * Root component for Remotion.
 * The Director Agent dynamically adds compositions here using register_composition tool.
 * 
 * Architecture: Projects are stored in root /projects folder (single source of truth)
 * Imports use @projects path alias: import { Comp } from '@projects/{projectId}/Main';
 */
export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Default placeholder composition - shows current preview */}
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={450}
                fps={30}
                width={1920}
                height={1080}
            />
            {/* Agent-registered compositions are dynamically added below */}
        <Composition
            id="8658a2d4-5cbb-44b6-98a7-44009a1c2b51:Main"
            component={Main_8658a2d4}
            durationInFrames={300}
            fps={30}
            width={1920}
            height={1080}
        />
        <Composition
            id="1023debb-cbbc-4153-b259-12867ffa8c71:Main"
            component={Main_1023debb}
            durationInFrames={450}
            fps={30}
            width={1920}
            height={1080}
        />


        </>
    );
};
