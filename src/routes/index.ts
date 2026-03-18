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
import notificationRoutes from './notificationRoutes.js';
import movementRoutes from './movementRoutes.js';
import noveltyRoutes from './noveltyRoutes.js';
import serviceRequestRoutes from './serviceRequestRoutes.js';
<<<<<<< HEAD
import rentalApplicationRoutes from './rentalApplicationRoutes.js';
import rentalContractRoutes from './rentalContractRoutes.js';
=======
import reportRoutes from './reportRoutes.js';
>>>>>>> 40a40604e2c430d1532776dd95a759d6f12e90d5

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/wompi', wompiRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/rentals', rentalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/movements', movementRoutes);
router.use('/novelties', noveltyRoutes);
router.use('/service-requests', serviceRequestRoutes);
<<<<<<< HEAD
router.use('/rental-applications', rentalApplicationRoutes);
router.use('/contracts', rentalContractRoutes);
=======
router.use('/reports', reportRoutes);
>>>>>>> 40a40604e2c430d1532776dd95a759d6f12e90d5

export default router;

