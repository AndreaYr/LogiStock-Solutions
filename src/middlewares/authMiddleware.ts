/**
 * Middlewares de autenticación y autorización.
 *
 * authenticate  → verifica el JWT del header Authorization.
 * authorize     → verifica que el usuario tenga uno dei los roles requeridos.
 */

import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/tokenService.js';
import { UserRole } from '../interfaces/interfaces.js';

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

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token no proporcionado.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = tokenService.verifyAccessToken(token);
        req.user = {
            userId: payload.userId,
            roleId: payload.roleId,
            role: payload.role,
        };
        next();
    } catch {
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
