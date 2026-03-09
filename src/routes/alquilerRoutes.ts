import { Router } from 'express';
import { AlquilerController } from '../controllers/alquilerController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de alquileres requieren estar autenticado
router.use(authenticate);

/** GET /api/alquileres/me → Mis bodegas alquiladas */
router.get('/me', AlquilerController.getMyRentals);

export default router;
