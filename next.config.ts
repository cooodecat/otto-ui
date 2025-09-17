import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
  async rewrites() {
    return [
      // 프로젝트별 로그
      {
        source: '/projects/:projectId/logs',
        destination: '/logs?projectId=:projectId',
      },
    ];
  },
};

export default nextConfig;
