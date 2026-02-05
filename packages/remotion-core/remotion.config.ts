import { Config } from '@remotion/cli/config';
import path from 'path';

Config.overrideWebpackConfig((currentConfiguration) => {
    return {
        ...currentConfiguration,
        resolve: {
            ...currentConfiguration.resolve,
            alias: {
                ...currentConfiguration.resolve?.alias,
                // Allow imports from @projects (root level projects folder)
                '@projects': path.resolve(__dirname, '../../projects'),
            },
        },
    };
});
