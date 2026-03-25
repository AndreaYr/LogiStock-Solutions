/**
 * Middlewares de autenticación y autorización.
 *
 * authenticate  → verifica el JWT del header Authorization.
 * authorize     → verifica que el usuario tenga uno dei los roles requeridos.
 */

import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/tokenService.js';
import { UserRole } from '../interfaces/interfaces.js';

// Logger simple
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || '')
};

// Extiende Express.Request para incluir el payload del token
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                roleId: number;
                role: UserRole;
            };
        }
    }
}

/** Verifica el JWT y adjunta el payload al request */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    logger.info(`[AuthMiddleware] Request to ${req.method} ${req.path}`, {
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader?.substring(0, 20) + (authHeader ? '...' : ''),
        allHeaders: Object.keys(req.headers),
    });

    if (!authHeader?.startsWith('Bearer ')) {
        logger.warn(`[AuthMiddleware] Missing or invalid Bearer token on ${req.path}`);
        res.status(401).json({ message: 'Token no proporcionado.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = tokenService.verifyAccessToken(token);
        logger.info('[AuthMiddleware] Token verified for user', payload.userId);
        req.user = {
            userId: payload.userId,
            roleId: payload.roleId,
            role: payload.role,
        };
        next();
    } catch {
        logger.error('[AuthMiddleware] Token verification failed');
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
}

/** Verifica que el usuario tenga al menos uno de los roles permitidos */
export function authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'No autenticado.' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'No tienes permisos para esta acción.' });
            return;
        }

        next();
    };
}
