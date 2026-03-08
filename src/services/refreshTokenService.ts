// Crea, valida y revoca refresh tokens
import refreshTokenRepositories, { RefreshTokenRepository } from "../repositories/refreshTokenRepositories.js";
import tokenService from "./tokenService.js";
import { env } from "../config/env.js";
import RefreshToken from "../models/refreshTokenModel.js";

class RefreshTokenService {
    //Genera un nuevo refresh token y lo guarda en BD
    async create(userId: number, ipAddress?: string, userAgent?: string): Promise<RefreshToken> {
        const token = tokenService.generateRefreshTokenValue();
        // expiresAt = ahora + los días configurados en env
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const repo = new RefreshTokenRepository();
        return repo.create({
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
        const repo = new RefreshTokenRepository();
        const refreshToken = await repo.findByToken(token);
        if (!refreshToken || !refreshToken.isValid()) return null;

        return refreshToken;
    }


}