// Crea, valida y revoca refresh tokens
import refreshTokenRepository  from "../repositories/refreshTokenRepositories.js";
import tokenService from "./tokenService.js";
import { env } from "../config/env.js";
import RefreshToken from "../models/refreshTokenModel.js";

class RefreshTokenService {
    //Genera un nuevo refresh token y lo guarda en BD
    async create(userId: number, ipAddress?: string, userAgent?: string): Promise<RefreshToken> {
        const token = tokenService.generateRefreshTokenValue();
        // expiresAt = ahora + los días configurados en env
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return refreshTokenRepository.create({
            userId,
            token,
            expiresAt,
            isRevoked: false,
            ipAddress: ipAddress ?? null,
            userAgent: userAgent ?? null
        });
    }

    //busca el token en BD, verifica que no esté revocado ni expirado
    async findAndValidate(token: string): Promise<RefreshToken | null> {
        const refreshToken = await refreshTokenRepository.findByToken(token);
        if (!refreshToken || !refreshToken.isValid()) return null;

        return refreshToken;
    }

    // Revoca un token especifico (logout de un dispositivo)
    async revokeAll(userId: number): Promise<number> {
        return refreshTokenRepository.revokeByUserId(userId);
    }

    // Elimina todos los tokens expirados
    async deleteExpired(): Promise<number> {
        return refreshTokenRepository.deleteExpired();
    }
}

export default new RefreshTokenService();