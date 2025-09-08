const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: (() => {
      const base = [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' data: blob: https: http: ws: wss:",
        "form-action 'self'",
      ]
      if (process.env.NODE_ENV === 'production') {
        base.push("style-src 'self'")
        base.push("script-src 'self' blob:")
      } else {
        base.push("style-src 'self' 'unsafe-inline'")
        base.push("script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:")
      }
      return base.join('; ')
    })(),
  },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/home(.*)',
        headers: [
          ...securityHeaders.filter(h=>h.key!=='Permissions-Policy'),
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/profile(.*)',
        headers: [
          ...securityHeaders.filter(h=>h.key!=='Permissions-Policy'),
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
