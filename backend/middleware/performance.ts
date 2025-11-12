import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

/**
 * Performance monitoring middleware for tracking API endpoint response times
 *
 * Logs all requests with their duration and warns about slow requests (>200ms)
 *
 * Usage: app.use(performanceMiddleware)
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;

    // Log slow requests with warning
    if (duration > 200) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }

    // Log all requests with performance data
    console.log(`[PERF] ${req.method} ${req.path}: ${duration.toFixed(2)}ms`);
  });

  next();
};
