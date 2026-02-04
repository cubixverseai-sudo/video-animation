import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@director/remotion'],
    images: {
        domains: ['localhost'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    webpack: (config) => {
        // Add path aliases for projects and components (single source of truth architecture)
        config.resolve.alias = {
            ...config.resolve.alias,
            '@projects': path.resolve(__dirname, '../../projects'),
            '@components': path.resolve(__dirname, '../../packages/remotion-core/src/components'),
        };
        return config;
    },
};

export default nextConfig;
