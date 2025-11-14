import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID || process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.careemo.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  // リダイレクトルール
  async redirects() {
    return [
      {
        source: '/:siteSlug/index', // マッチさせたいパス
        destination: '/:siteSlug', // リダイレクト先のパス
        permanent: true, // これで301リダイレクトになる
      },
      // 他のリダイレクトルールがあればここに追加
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:siteSlug/style.css',
        destination: '/api/:siteSlug/css',
      },
    ];
  },
  // ローカル開発用の設定
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
