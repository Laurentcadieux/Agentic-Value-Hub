import type { NextConfig } from 'next'

// Phase 1: typedRoutes disabled for build stability across the many dynamic
// [slug] links in the public website. Phase 0 deps and schema are untouched.
const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
