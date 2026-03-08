/**
 * Controller de autenticación
 * Maneja: registro, login, refresh y logout.
 */

import { Request, Response } from 'express';
import authService from '../services/authService.js';

export const AuthController = {

    /** POST /api/auth/register */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { firstName, lastName, email, password, phone } = req.body;

            if (!firstName || !lastName || !email || !password) {
                res.status(400).json({ message: 'firstName, lastName, email y password son requeridos.' });
                return;
            }

            const tokens = await authService.register({ firstName, lastName, email, password, phone });
            res.status(201).json({ message: 'Usuario registrado exitosamente.', ...tokens });
        } catch (err: any) {
            const status = err.message.includes('ya está registrado') ? 409 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /** POST /api/auth/login */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: 'email y password son requeridos.' });
                return;
            }

            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip ?? 'unknown';
            const userAgent = req.headers['user-agent'];

            const tokens = await authService.login({ email, password, ipAddress, userAgent });
            res.status(200).json({ message: 'Login exitoso.', ...tokens });
        } catch (err: any) {
            const status = err.message.includes('Credenciales') || err.message.includes('bloqueada') ? 401 : 500;
            res.status(status).json({ message: err.message });
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
};
