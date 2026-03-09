/**
 * Servicio de autenticación
 * Orquesta: registro, login, refresh de token y logout.
 */

import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepositories.js';
import { RefreshTokenRepository } from '../repositories/refreshTokenRepositories.js';
import { LoginAttemptRepository } from '../repositories/loginAttemptRepositories.js';
import roleRepository from '../repositories/roleRepositories.js';
import tokenService from './tokenService.js';
import { sendWelcomeEmail, sendLoginAlertEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from './emailService.js';
import notificationService from './notificationService.js';
import { UserRole } from '../interfaces/interfaces.js';
import { env } from '../config/env.js';
import crypto from 'crypto';
import { Op } from 'sequelize';

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

        const clientRole = await roleRepository.findByName(UserRole.CLIENTE);
        if (!clientRole) throw new Error('Rol CLIENTE no encontrado. Ejecuta el seeder de roles.');

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
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        // Enviar email de bienvenida (no bloquea si falla)
        sendWelcomeEmail(user.email, user.firstName).catch(console.error);
        notificationService.notifyUserRegistered(user.id, user.firstName).catch(console.error);

        return this._issueTokens(user.id, user.roleId, clientRole.name);
    }

    /**
     * Autentica al usuario y devuelve los tokens.
     * Registra el intento en login_attempts.
     * Bloquea la cuenta tras MAX_FAILED_ATTEMPTS intentos fallidos.
     */
    async login(dto: LoginDto): Promise<AuthTokens> {
        const { email, password, ipAddress, userAgent } = dto;
        console.log(`[AuthService] Intentando login para: ${email} desde ${ipAddress}`);

        try {
            const user = await userRepo.findByEmail(email);
            console.log(`[AuthService] Usuario encontrado: ${!!user}`);

            // Contar intentos fallidos recientes
            if (user) {
                const failedCount = await loginAttemptRepo.countFailedByEmail(email);
                console.log(`[AuthService] Intentos fallidos recientes: ${failedCount}`);
                if (failedCount >= MAX_FAILED_ATTEMPTS) {
                    await userRepo.lockAccount(user.id);
                    await loginAttemptRepo.create({ userId: user.id, email, success: false, ipAddress, userAgent, attemptedAt: new Date() });
                    throw new Error('Cuenta bloqueada temporalmente por múltiples intentos fallidos.');
                }
            }

            console.log(`[AuthService] Comparando contraseña...`);
            const invalid = !user || !(await bcrypt.compare(password, user.password));

            if (invalid) {
                console.log(`[AuthService] Credenciales inválidas para: ${email}`);
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

            if (!user.isActive) {
                console.log(`[AuthService] Cuenta inactiva: ${email}`);
                throw new Error('La cuenta está desactivada.');
            }

            // Registrar intento exitoso
            console.log(`[AuthService] Login exitoso, registrando intento...`);
            await loginAttemptRepo.create({ userId: user.id, email, success: true, ipAddress, userAgent, attemptedAt: new Date() });
            await userRepo.update(user.id, { lastLogin: new Date() });

            // Notificación de alerta de acceso (no bloquea si falla)
            console.log(`[AuthService] Enviando alertas...`);
            sendLoginAlertEmail(user.email, user.firstName, ipAddress, userAgent ?? null).catch(err => {
                console.error('[AuthService] ❌ Error enviando email de alerta:', err);
            });
            notificationService.notifyLogin(user.id, ipAddress).catch(err => {
                console.error('[AuthService] ❌ Error creando notificación de login:', err);
            });

            console.log(`[AuthService] Buscando rol para ${email}...`);
            const role = await roleRepository.findById(user.roleId);
            console.log(`[AuthService] Rol encontrado: ${role?.name}`);

            console.log(`[AuthService] Generando tokens...`);
            const tokens = await this._issueTokens(user.id, user.roleId, role?.name ?? UserRole.CLIENTE);
            console.log(`[AuthService] Tokens generados exitosamente.`);
            return tokens;

        } catch (err: any) {
            console.error(`[AuthService] ❌ ERROR en login:`, err);
            throw err;
        }
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
        const accessToken = tokenService.generateAccessToken(user.id, user.roleId, role?.name ?? UserRole.CLIENTE);
        return { accessToken };
    }

    /**
     * Cierra la sesión revocando el refresh token recibido.
     */
    async logout(refreshTokenValue: string): Promise<void> {
        await refreshTokenRepo.revokeToken(refreshTokenValue);
    }

    /**
     * Inicia el flujo de recuperación de contraseña generando un token.
     */
    async forgotPassword(email: string): Promise<void> {
        const user = await userRepo.findByEmail(email);
        if (!user) return; // Por seguridad no revelamos si existe o no

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await userRepo.update(user.id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hora
        });

        await sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(console.error);
    }

    /**
     * Restablece la contraseña usando un token válido.
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userRepo.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) throw new Error('Token inválido o expirado.');

        const hashed = await bcrypt.hash(newPassword, 12);
        await userRepo.update(user.id, {
            password: hashed,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        sendPasswordChangedEmail(user.email, user.firstName).catch(console.error);
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
