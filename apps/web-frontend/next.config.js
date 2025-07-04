/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure allowed development origins for cross-origin requests
  allowedDevOrigins: [
    'localhost:3001',
    '192.168.0.80:3001',
    '127.0.0.1:3001',
    'localhost:3000',
    '192.168.0.80:3000',
    '127.0.0.1:3000',
  ],

  // API configuration for production
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? `${process.env.BACKEND_URL || 'http://localhost:8000'}/:path*`
          : 'http://localhost:8000/:path*',
      },
    ];
  },

  // Headers for better security and CORS handling
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['localhost', '192.168.0.80'],
    formats: ['image/webp', 'image/avif'],
  },

  // Note: Webpack config removed as we're using Turbopack

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
  },

  // Output configuration for production
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
