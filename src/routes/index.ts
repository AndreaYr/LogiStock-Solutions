/**
 * Barril de rutas
 * Centraliza todas las rutas y las monta bajo /api
 */

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import wompiRoutes from './wompiRoutes.js';
import bodegaRoutes from './bodegaRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/wompi', wompiRoutes);
router.use('/bodegas', bodegaRoutes);

export default router;
