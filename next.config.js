/** @type {import('next').NextConfig} */
const precacheRevision =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.COMMIT_SHA ||
  process.env.npm_package_version ||
  'dev'

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheStartUrl: true,
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    additionalManifestEntries: [
      { url: '/', revision: precacheRevision },
      { url: '/configure', revision: precacheRevision },
      { url: '/configure/complex', revision: precacheRevision },
    ],
  },
})

const nextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
