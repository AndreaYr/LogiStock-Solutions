import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// Métricas del sistema (CPU, memoria, event loop, etc.)
collectDefaultMetrics({ register });

// ── Contadores HTTP ───────────────────────────────────────────────────────────

export const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total de peticiones HTTP recibidas',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

export const httpErrorsTotal = new Counter({
    name: 'http_errors_total',
    help: 'Total de respuestas con error (4xx y 5xx)',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

// ── Histograma de latencia ────────────────────────────────────────────────────

export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de peticiones HTTP en segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register],
});

// ── Métricas de negocio ───────────────────────────────────────────────────────

export const activeUsers = new Gauge({
    name: 'logistock_active_sessions',
    help: 'Sesiones activas (refresh tokens no revocados)',
    registers: [register],
});

export const loginAttemptsTotal = new Counter({
    name: 'logistock_login_attempts_total',
    help: 'Total de intentos de login',
    labelNames: ['success'],
    registers: [register],
});

export const serviceRequestsTotal = new Counter({
    name: 'logistock_service_requests_total',
    help: 'Total de solicitudes de servicio creadas',
    labelNames: ['type'],
    registers: [register],
});

export const warehouseOperationsTotal = new Counter({
    name: 'logistock_warehouse_operations_total',
    help: 'Operaciones realizadas sobre bodegas',
    labelNames: ['action'],
    registers: [register],
});

export const noveltyReportsTotal = new Counter({
    name: 'logistock_novelty_reports_total',
    help: 'Total de novedades reportadas',
    registers: [register],
});
