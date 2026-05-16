/**
 * @file next.config.ts
 * @description Next.js configuration for Sypho.io.
 *
 * Security headers (CSP, HSTS, etc.) are injected via middleware/index.ts
 * on every response, not here, to allow dynamic directives (e.g. nonces).
 *
 * @compliance GDPR / OWASP — strict security posture.
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Strict mode surfaces extra warnings for unsafe lifecycle patterns
   * and helps identify side effects in components.
   */
  reactStrictMode: true,

  /**
   * Disable the X-Powered-By header to reduce information leakage.
   * Security best practice per OWASP.
   */
  poweredByHeader: false,

  /**
   * Server Actions configuration.
   * Only allow origins explicitly listed here.
   */
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        process.env.NEXT_PUBLIC_APP_URL ?? '',
      ].filter(Boolean),
    },
  },

  /**
   * Restrict image optimization to trusted domains only.
   * No external image sources by default; add domains as integrations grow.
   */
  images: {
    domains: [],
  },
};

export default nextConfig;
