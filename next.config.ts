import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' data: blob: https: http: ws: wss: https://storage.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.google.com https://www.googleapis.com https://www.gstatic.com https://firebaseinstallations.googleapis.com https://firebasestorage.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://www.gstatic.com",
      "worker-src 'self' blob: https://cdn.jsdelivr.net",
      "form-action 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    ].join('; ')
  },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: "camera=(self), microphone=(), geolocation=()" },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  reactStrictMode: true,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
  webpack: (config: import('webpack').Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      if (!config.resolve) {
        config.resolve = {};
      }
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config
  },
}

export default nextConfig
