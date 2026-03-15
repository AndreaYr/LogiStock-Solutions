/**
 * Controller de autenticación
 * Maneja: registro, login, refresh y logout.
 */

import { Request, Response } from 'express';
import authService from '../services/authService.js';
import { env } from '../config/env.js';

export const AuthController = {

    /** POST /api/auth/register */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { firstName, lastName, email, password, phone } = req.body;

            if (!firstName || !lastName || !email || !password) {
                res.status(400).json({ message: 'firstName, lastName, email y password son requeridos.' });
                return;
            }

            await authService.register({ firstName, lastName, email, password, phone });
            res.status(201).json({ message: 'Cuenta creada. Revisa tu correo para verificar tu cuenta.' });
        } catch (err: any) {
            const status = err.message.includes('ya está registrado') ? 409 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * POST /api/auth/login
     * Primera fase del login: valida credenciales y envía OTP al correo.
     * Responde con { otpRequired: true } para indicar que falta el segundo paso.
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: 'email y password son requeridos.' });
                return;
            }

            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip ?? 'unknown';
            const userAgent = req.headers['user-agent'];

            const result = await authService.login({ email, password, ipAddress, userAgent });
            res.status(200).json({ message: 'Código de verificación enviado a tu correo.', ...result });
        } catch (err: any) {
            console.error('[AuthController] ❌ ERROR EN LOGIN:', err);
            const status = err.message?.includes('Credenciales') || err.message?.includes('bloqueada') ? 401 : 500;
            res.status(status).json({
                message: err.message || 'Error interno del servidor',
            });
        }
    },

    /**
     * POST /api/auth/verify-otp
     * Segunda fase del login: valida el OTP ingresado por el usuario.
     * Si es correcto, devuelve accessToken + refreshToken para iniciar la sesión.
     */
    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                res.status(400).json({ message: 'email y code son requeridos.' });
                return;
            }

            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip ?? 'unknown';
            const userAgent = req.headers['user-agent'];

            const tokens = await authService.verifyOtp(email, code, ipAddress, userAgent);
            res.status(200).json({ message: 'Autenticación exitosa.', ...tokens });
        } catch (err: any) {
            const status = err.message?.includes('incorrecto') || err.message?.includes('expirado') ? 401 : 500;
            res.status(status).json({ message: err.message || 'Error interno del servidor' });
        }
    },

    /** POST /api/auth/refresh */
    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ message: 'refreshToken es requerido.' });
                return;
            }

            const result = await authService.refresh(refreshToken);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(401).json({ message: err.message });
        }
    },

    /** POST /api/auth/logout */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ message: 'refreshToken es requerido.' });
                return;
            }

            await authService.logout(refreshToken);
            res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** POST /api/auth/forgot-password */
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: 'email es requerido.' });
                return;
            }

            await authService.forgotPassword(email);
            // Siempre respondemos 200 por seguridad (no confirmar si el email existe)
            res.status(200).json({ message: 'Si el correo está registrado, recibirás un link de recuperación.' });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** POST /api/auth/reset-password */
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                res.status(400).json({ message: 'token y newPassword son requeridos.' });
                return;
            }

            await authService.resetPassword(token, newPassword);
            res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    },

    /**
     * GET /api/auth/verify-email?token=xxx
     * Verifica el token, actualiza la BD y redirige al frontend con el resultado.
     * El frontend lee ?verified=true o ?error=mensaje para mostrar el estado.
     */
    async verifyEmail(req: Request, res: Response): Promise<void> {
        const token = req.query.token as string;
        const appUrl = env.APP_URL;

        if (!token) {
            res.redirect(`${appUrl}/verify-email?error=Token+requerido`);
            return;
        }

        try {
            const tokens = await authService.verifyEmail(token);
            res.redirect(
                `${appUrl}/verify-email?verified=true&accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
            );
        } catch (err: any) {
            const msg = encodeURIComponent(err.message ?? 'Token inválido o expirado');
            res.redirect(`${appUrl}/verify-email?error=${msg}`);
        }
    },
};
