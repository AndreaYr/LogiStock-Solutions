/**
 * Tests unitarios para TokenService
 * Verifica generación y verificación de JWT sin tocar la BD.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { UserRole } from '../../interfaces/interfaces.js';

// Simular variables de entorno antes de importar el servicio
beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-secret-super-seguro-12345';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.NODE_ENV = 'test';
});

// Import dinámico para que tome las variables de entorno
const getTokenService = async () => (await import('../../services/tokenService.js')).default;

describe('TokenService', () => {

    it('genera un accessToken con el formato JWT correcto', async () => {
        const tokenService = await getTokenService();
        const token = tokenService.generateAccessToken(1, 2, UserRole.ADMIN);

        expect(token).toBeTypeOf('string');
        expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('genera un refreshToken como string hexadecimal de 80 chars', async () => {
        const tokenService = await getTokenService();
        const refresh = tokenService.generateRefreshTokenValue();

        expect(refresh).toBeTypeOf('string');
        expect(refresh).toHaveLength(80);
        expect(refresh).toMatch(/^[a-f0-9]+$/); // solo hex
    });

    it('verifica un accessToken válido y retorna el payload correcto', async () => {
        const tokenService = await getTokenService();
        const token = tokenService.generateAccessToken(42, 3, UserRole.CLIENTE);
        const payload = tokenService.verifyAccessToken(token);

        expect(payload.userId).toBe(42);
        expect(payload.roleId).toBe(3);
        expect(payload.role).toBe(UserRole.CLIENTE);
    });

    it('lanza error al verificar un token inválido', async () => {
        const tokenService = await getTokenService();
        expect(() => tokenService.verifyAccessToken('token.falso.invalido')).toThrow();
    });

    it('lanza error al verificar un token con firma alterada', async () => {
        const tokenService = await getTokenService();
        const token = tokenService.generateAccessToken(1, 1, UserRole.ADMIN);

        // Alterar la firma
        const parts = token.split('.');
        const tampered = `${parts[0]}.${parts[1]}.firmafalsa`;

        expect(() => tokenService.verifyAccessToken(tampered)).toThrow();
    });
});
