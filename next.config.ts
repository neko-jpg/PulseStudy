// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "img-src * data: blob:",
      "media-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com",
      "frame-src 'self'",
      // ← ここが今回の本丸：ASCIIのみ・1行
      "connect-src 'self' data: blob: https: http: ws: wss: https://storage.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.google.com https://www.googleapis.com https://www.gstatic.com https://firebaseinstallations.googleapis.com https://firebasestorage.googleapis.com",
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
