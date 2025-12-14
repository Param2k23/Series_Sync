/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Series_Sync',
  assetPrefix: '/Series_Sync/',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
