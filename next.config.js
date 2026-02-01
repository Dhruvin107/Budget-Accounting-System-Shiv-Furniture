/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['nesaorgfiles.blob.core.windows.net'],
    unoptimized: true,
  },
}

module.exports = nextConfig
