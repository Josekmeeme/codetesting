/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Image domains for optimized hosting (e.g. Supabase storage or external CDN)
  images: {
    domains: ['cdn.jsdelivr.net', 'supabase.co', 'ik.imagekit.io'],
  },

  // Environment variable passthrough (safe ones)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  },

  // Experimental settings if needed
  experimental: {
    serverActions: true,
    appDir: true
  },

  // Output directory for static export (optional)
  output: 'standalone'
};

module.exports = nextConfig; 
