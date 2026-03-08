/**
 * Servicio de tokens JWT
 * Centraliza la generacion y verificación de access tokens
 * y la generación de refresh tokens
 */

import jwt from 'jsonwebtoken';
import {randomBytes} from 'crypto';
import {env} from '../config/env.js';
import { UserRole } from '../interfaces/interfaces.js';

export interface JwtAccessPayload {
    userId: number;
    roleId: number;
    role: UserRole;
    iat?: number;
    exp?: number;
}

class TokenService {
    /**
     * Genera un access token JWT firmado con la clave secreta
     * @param userId ID del usuario autenticado
     * @param roleId ID del rol del usuario
     * @param role Nombre del rol del usuario
     */

    generateAccessToken(userId: number, roleId: number, role: UserRole): string {
        const payload: Omit<JwtAccessPayload, 'iat' | 'exp'> = { userId, roleId, role };
        return jwt.sign(
            payload,
            env.JWT_ACCESS_SECRET,
            {expiresIn: (env.JWT_ACCESS_EXPIRY || '15m')} as jwt.SignOptions
        );
    }

    /**
     * Genera unn valor aleatorio para usar como refresh token
     */

    generateRefreshTokenValue(): string {
        return randomBytes(40).toString('hex');
    }

    /**
     * Verifica y decodifica un access token.
     * Lanza error si el token no es válido o ha expirado.
     * @param token el JWT recibido del cliente
     */
    verifyAccessToken(token: string): JwtAccessPayload {
        return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    }

}

export default new TokenService();
