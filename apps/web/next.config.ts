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
    // Serve assets from projects folder via API routes
    async rewrites() {
        return [
            {
                source: '/assets/:projectId/audio/:path*',
                destination: '/api/audio/:projectId/:path*',
            },
            {
                source: '/assets/:projectId/images/:path*',
                destination: '/api/images/:projectId/:path*',
            },
        ];
    },
    webpack: (config) => {
        // Add path aliases for projects
        config.resolve.alias = {
            ...config.resolve.alias,
            '@projects': path.resolve(__dirname, '../../projects'),
        };
        return config;
    },
};

export default nextConfig;
