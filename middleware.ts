/**
 * @file middleware.ts
 * @description Next.js Middleware entry — session refresh and route guards.
 *
 * CRITICAL: All `/dashboard` and `/dashboard/*` routes require a valid Supabase
 * session. Unauthenticated visitors are redirected to `/login` with the original
 * path preserved as `?redirect=`.
 *
 * Implementation: `middleware/index.ts`
 */

export { middleware, config } from './middleware/index';
