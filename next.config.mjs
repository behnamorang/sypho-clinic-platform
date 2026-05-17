/**
 * @file next.config.mjs
 * @description Next.js configuration for Sypho.io.
 *
 * Security headers (CSP, HSTS, etc.) are injected via middleware/index.ts
 * on every response, not here, to allow dynamic directives (e.g. nonces).
 *
 * @compliance GDPR / OWASP — strict security posture.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    /**
     * Next.js 14 defaults this to true: `useSearchParams()` without a parent
     * Suspense boundary fails the production build. Set to false to restore
     * warning-only behavior (page may deopt to client rendering).
     * Does not affect `cookies()` / `headers()` from `next/headers`.
     * @see https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
     */
    missingSuspenseWithCSRBailout: false,
  },

  /**
   * Seconds allowed per page during the static generation phase before the
   * build aborts that page. Helps slow CI; unrelated to dynamic API detection.
   * @default 60
   */
  staticPageGenerationTimeout: 120,

  /**
   * Restrict image optimization to trusted domains only.
   * No external image sources by default; add domains as integrations grow.
   */
  images: {
    domains: [],
  },
};

export default nextConfig;
