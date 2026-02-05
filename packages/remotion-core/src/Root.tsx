import React from 'react';
import { Composition } from 'remotion';
import { CurrentComposition } from './index';
import { Main as Main_3574642a } from '@projects/3574642a-13bf-4dcc-896f-a340aabc4ec2/Main';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={150}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="3574642a-13bf-4dcc-896f-a340aabc4ec2:Main"
                component={Main_3574642a}
                durationInFrames={150}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
