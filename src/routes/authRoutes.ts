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
router.post('/login',    AuthController.login);
router.post('/refresh',  AuthController.refresh);
router.post('/logout',   AuthController.logout);

export default router;
