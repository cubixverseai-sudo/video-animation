import { Config } from '@remotion/cli/config';
import path from 'path';

Config.overrideWebpackConfig((currentConfiguration) => {
    return {
        ...currentConfiguration,
        resolve: {
            ...currentConfiguration.resolve,
            alias: {
                ...currentConfiguration.resolve?.alias,
                // Allow projects to import from @components
                '@components': path.resolve(__dirname, 'src/components'),
                // Allow imports from @projects (root level projects folder)
                '@projects': path.resolve(__dirname, '../../projects'),
            },
        },
    };
});
