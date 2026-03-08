// Crea, valida y revoca refresh tokens
import refreshTokenRepositories, { RefreshTokenRepository } from "../repositories/refreshTokenRepositories.js";
import tokenService from "./tokenService.js";
import {env} from "../config/env.js";
import RefreshToken from "../models/refreshTokenModel.js";

class RefreshTokenService {
    //Genera un nuevo refresh token y lo guarda en BD
    async create(userId: number, ipAddress?: string, userAgent?: string): Promise<RefreshToken>{
        const token = tokenService.generateRefreshTokenValue();
        // expiresAt = ahora + los días configurados en env
        const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    
        return RefreshTokenRepository.create({
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
        const refreshToken = await RefreshTokenRepository.findByToken(token);
        if(!RefreshToken || !refreshToken.isvalid()) return null;
        
        return refreshToken;
    }


}