/**
 * Rutas de autenticación
 * Todas son públicas (no requieren JWT).
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/refresh
 * POST /api/auth/logout
 */

import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Autenticación en 2 pasos — segunda fase del login
router.post('/verify-otp', AuthController.verifyOtp);

// Recuperación de contraseña
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Verificación de email (GET con token en query param)
router.get('/verify-email', AuthController.verifyEmail);

export default router;
