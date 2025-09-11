// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // In production, enforce type checks; in dev, allow iteration speed
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
  eslint: {
    // In production, enforce ESLint; in dev, allow iteration speed
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "img-src * data: blob:",
      "media-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      // Relax inline/eval only in development; tighten in production
      isProd
        ? "style-src 'self' https://fonts.googleapis.com"
        : "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      isProd
        ? "script-src 'self' https://www.gstatic.com"
        : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com",
      "frame-src 'self'",
      // ← ここが今回の本丸：ASCIIのみ・1行
      "connect-src 'self' data: blob: https://storage.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.google.com https://www.googleapis.com https://www.gstatic.com https://firebaseinstallations.googleapis.com https://firebasestorage.googleapis.com wss://*.firebaseio.com",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "0" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
