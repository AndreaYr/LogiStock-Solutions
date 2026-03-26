import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const baseAllowedOrigins = env.ALLOWED_ORIGINS.filter(Boolean);

const mobileAllowedOrigins = [
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
];

const allowedOrigins = new Set([...baseAllowedOrigins, ...mobileAllowedOrigins]);

// Configuración de Helmet para Security Headers
export const securityHeaders = helmet();

// Configuración de CORS
export const corsConfig = cors({
    origin: (origin, callback) => {
        // Permite requests server-to-server o tools sin header Origin
        if (!origin) return callback(null, true);

        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

// Configuración de Rate Limiter
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 100, // Límite de 100 peticiones por IP por cada ventana (windowMs)
    standardHeaders: 'draft-8', // Draft-8 o un valor estándar
    legacyHeaders: false, // Deshabilitar `X-RateLimit-*` headers
    message: { message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo después de 15 minutos.' },
    // Skip para health check
    skip: (req) => req.path === '/health',
});
