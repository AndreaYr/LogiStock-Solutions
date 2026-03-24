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
import { sendWelcomeEmail, sendVerificationEmail, sendLoginAlertEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendOtpEmail } from './emailService.js';
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
    async register(dto: RegisterDto): Promise<void> {
        const existing = await userRepo.findByEmail(dto.email);
        if (existing) throw new Error('El email ya está registrado.');

        const clientRole = await roleRepository.findByName(UserRole.CLIENTE);
        if (!clientRole) throw new Error('Rol CLIENTE no encontrado. Ejecuta el seeder de roles.');

        const hashed = await bcrypt.hash(dto.password, 12);

        // Generar token de verificación: el raw se envía por email, el hash se guarda en BD
        const rawVerificationToken    = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
        const verificationExpires     = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

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
            resetPasswordExpires: null,
            emailVerificationToken:   hashedVerificationToken,
            emailVerificationExpires: verificationExpires,
        });

        // Enviar email de verificación con el token SIN hashear (no bloquea si falla)
        sendVerificationEmail(user.email, user.firstName, rawVerificationToken).catch(console.error);
    }

    /**
     * Primera fase del login: valida credenciales y envía OTP al correo.
     * No devuelve tokens — el usuario debe completar el segundo paso con verifyOtp().
     */
    async login(dto: LoginDto): Promise<{ otpRequired: boolean, accessToken?: string, refreshToken?: string }> {
        const { email, password, ipAddress, userAgent } = dto;

        const user = await userRepo.findByEmail(email);

        // Contar intentos fallidos recientes y bloquear si supera el límite
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

        // Bloquear login si el email no ha sido verificado
        if (!user.isVerified) throw new Error('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');

        // Bypass OTP en desarrollo local para agilizar las pruebas
        if (env.NODE_ENV === 'development') {
            await userRepo.update(user.id, { lastLogin: new Date() });
            await loginAttemptRepo.create({ userId: user.id, email, success: true, ipAddress, userAgent, attemptedAt: new Date() });
            
            const role = await roleRepository.findById(user.roleId);
            const roleName = role?.name ?? UserRole.CLIENTE;
            const tokens = await this._issueTokens(user.id, user.roleId, roleName);
            
            return { otpRequired: false, ...tokens };
        }

        // Generar OTP de 6 dígitos, hashearlo y guardarlo con expiración de 10 minutos
        const rawOtp    = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        await userRepo.update(user.id, { otpCode: hashedOtp, otpExpires });

        // Enviar OTP al correo (no bloquea el flujo si falla)
        sendOtpEmail(user.email, user.firstName, rawOtp).catch(console.error);

        return { otpRequired: true };
    }

    /**
     * Segunda fase del login: valida el OTP ingresado por el usuario.
     * Si es correcto y no ha expirado, emite los tokens de sesión.
     */
    async verifyOtp(email: string, code: string, ipAddress: string, userAgent?: string): Promise<AuthTokens> {
        const user = await userRepo.findByEmail(email);

        if (!user || !user.otpCode || !user.otpExpires) {
            throw new Error('Sesión OTP no encontrada. Inicia sesión nuevamente.');
        }

        // Verificar expiración del OTP
        if (user.otpExpires < new Date()) {
            await userRepo.update(user.id, { otpCode: null, otpExpires: null });
            throw new Error('El código ha expirado. Inicia sesión nuevamente.');
        }

        // Comparar el código ingresado con el hash guardado
        const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
        if (hashedInput !== user.otpCode) {
            throw new Error('Código incorrecto.');
        }

        // OTP válido — limpiar campos y completar el login
        await userRepo.update(user.id, {
            otpCode: null,
            otpExpires: null,
            lastLogin: new Date(),
        });

        // Registrar intento exitoso y enviar alertas
        await loginAttemptRepo.create({ userId: user.id, email, success: true, ipAddress, userAgent, attemptedAt: new Date() });
        sendLoginAlertEmail(user.email, user.firstName, ipAddress, userAgent ?? null).catch(console.error);
        notificationService.notifyLogin(user.id, ipAddress).catch(console.error);

        console.log(`Login: user.id=${user.id}, user.roleId=${user.roleId}`);
        const role = await roleRepository.findById(user.roleId);
        console.log(`Login: role found?`, !!role, role?.name);
        const roleName = role?.name ?? UserRole.CLIENTE;
        console.log(`Login: roleName=${roleName}`);
        return this._issueTokens(user.id, user.roleId, roleName);
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

    /**
     * Verifica el email del usuario usando el token recibido por correo.
     * - Hashea el token recibido y lo busca en la BD
     * - Valida que no haya expirado (24h)
     * - Marca isVerified = true y limpia los campos del token
     * - Envía email de bienvenida al confirmar
     */
    async verifyEmail(rawToken: string): Promise<AuthTokens> {
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await userRepo.findOne({
            where: {
                emailVerificationToken:   hashedToken,
                emailVerificationExpires: { [Op.gt]: new Date() }, // token no expirado
            },
        });

        if (!user) throw new Error('Token de verificación inválido o expirado.');

        // Marcar cuenta como verificada y limpiar el token
        await userRepo.update(user.id, {
            isVerified:               true,
            emailVerificationToken:   null,
            emailVerificationExpires: null,
        });

        // Enviar email de bienvenida y notificación ahora que la cuenta está confirmada
        sendWelcomeEmail(user.email, user.firstName).catch(console.error);
        notificationService.notifyUserRegistered(user.id, user.firstName).catch(console.error);

        // Emitir tokens para que el usuario quede autenticado directamente
        const role = await roleRepository.findById(user.roleId);
        return this._issueTokens(user.id, user.roleId, role?.name ?? UserRole.CLIENTE);
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
