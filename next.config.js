/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for development - uncomment for static export
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // distDir: 'out', // Only needed for static export
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: true
  }
}

module.exports = nextConfig