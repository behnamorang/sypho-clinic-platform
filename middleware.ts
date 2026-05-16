/**
 * @file middleware.ts
 * @description Next.js Middleware entry point for Sypho.io.
 *
 * This file is the required entry point for Next.js middleware
 * (must be at the project root, adjacent to app/).
 *
 * Implementation lives in middleware/index.ts for better organization.
 * This file simply re-exports the middleware function and config.
 *
 * @see middleware/index.ts for the full implementation.
 */

export { middleware, config } from './middleware/index';
