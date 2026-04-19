import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpErrorsTotal, httpRequestDuration } from '../config/metrics.js';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path ?? req.path ?? 'unknown';
        const method = req.method;
        const status = String(res.statusCode);

        httpRequestsTotal.inc({ method, route, status_code: status });
        httpRequestDuration.observe({ method, route, status_code: status }, duration);

        if (res.statusCode >= 400) {
            httpErrorsTotal.inc({ method, route, status_code: status });
        }
    });

    next();
}
