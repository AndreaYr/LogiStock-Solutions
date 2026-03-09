/**
 * rutas
 * Centraliza todas las rutas y las monta bajo /api
 */

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import wompiRoutes from './wompiRoutes.js';
import warehouseRoutes from './warehouseRoutes.js';
import rentalRoutes from './rentalRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/wompi', wompiRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/rentals', rentalRoutes);

export default router;
