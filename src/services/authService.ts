/**
<<<<<<< HEAD
 * Servicio de autenticación
 * Orquesta: registro, login, refresh de token y logout.
 */

import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepositories.js';
import { RefreshTokenRepository } from '../repositories/refreshTokenRepositories.js';
import { LoginAttemptRepository } from '../repositories/loginAttemptRepositories.js';
import roleRepository from '../repositories/roleRepositories.js';
import tokenService from './tokenService.js';
import { sendWelcomeEmail, sendLoginAlertEmail } from './emailService.js';
import { UserRole } from '../interfaces/interfaces.js';
import { env } from '../config/env.js';

const userRepo = new UserRepository();
const refreshTokenRepo = new RefreshTokenRepository();
const loginAttemptRepo = new LoginAttemptRepository();

const REFRESH_TOKEN_DAYS = 7;
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginDto {
    email: string;
    password: string;
    ipAddress: string;
    userAgent?: string;
}

// ─── Clase del servicio ───────────────────────────────────────────────────────

class AuthService {

    /**
     * Registra un nuevo usuario con rol CLIENT por defecto.
     */
    async register(dto: RegisterDto): Promise<AuthTokens> {
        const existing = await userRepo.findByEmail(dto.email);
        if (existing) throw new Error('El email ya está registrado.');

        const clientRole = await roleRepository.findByName(UserRole.CLIENT);
        if (!clientRole) throw new Error('Rol CLIENT no encontrado. Ejecuta el seeder de roles.');

        const hashed = await bcrypt.hash(dto.password, 12);

        const user = await userRepo.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashed,
            phone: dto.phone ?? null,
            roleId: clientRole.id,
            isActive: true,
            isVerified: false,
            lastLogin: null,
        });

        // Enviar email de bienvenida (no bloquea si falla)
        sendWelcomeEmail(user.email, user.firstName).catch(console.error);

        return this._issueTokens(user.id, user.roleId, clientRole.name);
    }

    /**
     * Autentica al usuario y devuelve los tokens.
     * Registra el intento en login_attempts.
     * Bloquea la cuenta tras MAX_FAILED_ATTEMPTS intentos fallidos.
     */
    async login(dto: LoginDto): Promise<AuthTokens> {
        const { email, password, ipAddress, userAgent } = dto;

        const user = await userRepo.findByEmail(email);

        // Contar intentos fallidos recientes
        if (user) {
            const failedCount = await loginAttemptRepo.countFailedByEmail(email);
            if (failedCount >= MAX_FAILED_ATTEMPTS) {
                await userRepo.lockAccount(user.id);
                await loginAttemptRepo.create({ userId: user.id, email, success: false, ipAddress, userAgent, attemptedAt: new Date() });
                throw new Error('Cuenta bloqueada temporalmente por múltiples intentos fallidos.');
            }
        }

        const invalid = !user || !(await bcrypt.compare(password, user.password));

        if (invalid) {
            await loginAttemptRepo.create({
                userId: user?.id ?? null,
                email,
                success: false,
                ipAddress,
                userAgent,
                attemptedAt: new Date(),
            });
            throw new Error('Credenciales inválidas.');
        }

        if (!user.isActive) throw new Error('La cuenta está desactivada.');

        // Registrar intento exitoso
        await loginAttemptRepo.create({ userId: user.id, email, success: true, ipAddress, userAgent, attemptedAt: new Date() });
        await userRepo.update(user.id, { lastLogin: new Date() });

        // Notificación de alerta de acceso (no bloquea si falla)
        sendLoginAlertEmail(user.email, user.firstName, ipAddress, userAgent ?? null).catch(console.error);

        const role = await roleRepository.findById(user.roleId);
        return this._issueTokens(user.id, user.roleId, role?.name ?? UserRole.CLIENT);
    }

    /**
     * Renueva el access token usando un refresh token válido.
     */
    async refresh(refreshTokenValue: string): Promise<Pick<AuthTokens, 'accessToken'>> {
        const tokenRecord = await refreshTokenRepo.findByToken(refreshTokenValue);

        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            throw new Error('Refresh token inválido o expirado.');
        }

        const user = await userRepo.findById(tokenRecord.userId);
        if (!user || !user.isActive) throw new Error('Usuario no encontrado o inactivo.');

        const role = await roleRepository.findById(user.roleId);
        const accessToken = tokenService.generateAccessToken(user.id, user.roleId, role?.name ?? UserRole.CLIENT);
        return { accessToken };
    }

    /**
     * Cierra la sesión revocando el refresh token recibido.
     */
    async logout(refreshTokenValue: string): Promise<void> {
        await refreshTokenRepo.revokeToken(refreshTokenValue);
    }

    // ─── Privado ──────────────────────────────────────────────────────────────

    private async _issueTokens(userId: number, roleId: number, role: UserRole): Promise<AuthTokens> {
        const accessToken = tokenService.generateAccessToken(userId, roleId, role);
        const refreshTokenValue = tokenService.generateRefreshTokenValue();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

        await refreshTokenRepo.create({
            userId,
            token: refreshTokenValue,
            expiresAt,
            isRevoked: false,
        });

        return { accessToken, refreshToken: refreshTokenValue };
    }
}

export default new AuthService();
=======
 * Orquesta todo lo relacionado con autenticacion
 */

import bcrypt from "bcryptjs";
import {env} from '../config/env.js';
import { UserRepository } from "../repositories/userRepositories.js";
import { RoleRepository } from "../repositories/roleRepositories.js";
import { LoginAttemptRepository } from "../repositories/loginAttemptRepositories.js";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepositories.js";
import tokenService, { JwtAccessPayload } from "./tokenService.js";
import { IUserCreationAttributes, IUser } from "../interfaces/interfaces.js";
//import {UnauthorizedError, BadRequestError} from "../utils/errors.js";

class AuthService {
    constructor(
        private users = UserRepository,
        private roles = RoleRepository,
        private attempts = LoginAttemptRepository,
        private refreshTokens = RefreshTokenRepository,
        private tokens = tokenService,
    ) {}

    async login(
        email: string,
        password: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<{accessToken: string; refreshToken: string}>
        const user = await this.users
        
    )
}
>>>>>>> main
