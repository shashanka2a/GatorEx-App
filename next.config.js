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
  },
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Increase API body size limit for image uploads
    },
  }
}

module.exports = nextConfig