/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the floating Next.js badge in development
  devIndicators: false,
  // This folder is the project root (there is an unrelated package-lock.json in the home folder)
  turbopack: {
    root: import.meta.dirname,
  },
}

export default nextConfig
