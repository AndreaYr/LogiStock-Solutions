import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Configuración de Helmet para Security Headers
export const securityHeaders = helmet();

// Configuración de CORS
export const corsConfig = cors({
    origin: env.ALLOWED_ORIGINS, // Utiliza orígenes definidos en el .env
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
    message: { message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo después de 15 minutos.' }
});
