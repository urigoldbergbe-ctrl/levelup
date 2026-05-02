/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/admin/leaders', destination: '/admin/mentors', permanent: true },
      { source: '/admin/leaders/:path*', destination: '/admin/mentors/:path*', permanent: true },
      { source: '/superadmin/leaders', destination: '/superadmin/mentors', permanent: true },
      { source: '/superadmin/leaders/:path*', destination: '/superadmin/mentors/:path*', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'media.wired.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
