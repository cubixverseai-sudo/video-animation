import React from 'react';
import { Composition } from 'remotion';
import { CurrentComposition } from './index';
import { StoriaPromo as StoriaPromo_7cc75a4c } from './projects/7cc75a4c-9ef6-4745-b878-dda5edcf169f/compositions/StoriaPromo';
import { FantasticLogoReveal as FantasticLogoReveal_846de09b } from './projects/846de09b-5276-4fdd-aa24-f81008da9ca4/templates/FantasticLogo/index';
import { StoriaPromo as StoriaPromo_24c78534 } from './projects/24c78534-a29b-4f7d-b834-4554ff1f9747/templates/StoriaPromo/index';

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
        <Composition
            id="7cc75a4c-9ef6-4745-b878-dda5edcf169f:StoriaPromo"
            component={StoriaPromo_7cc75a4c}
            durationInFrames={450}
            fps={30}
            width={1920}
            height={1080}
        />
        <Composition
            id="24c78534-a29b-4f7d-b834-4554ff1f9747:StoriaPromo"
            component={StoriaPromo_24c78534}
            durationInFrames={450}
            fps={30}
            width={1920}
            height={1080}
        />
        <Composition
            id="846de09b-5276-4fdd-aa24-f81008da9ca4:FantasticLogoReveal"
            component={FantasticLogoReveal_846de09b}
            durationInFrames={150}
            fps={30}
            width={1920}
            height={1080}
        />


        </>
    );
};
