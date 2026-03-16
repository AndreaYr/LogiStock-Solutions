import { Router } from 'express';
import { RentalController } from '../controllers/rentalController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Authenticated routes
router.use(authenticate);

/** GET /api/rentals/me → User's rented warehouses */
router.get('/me', RentalController.getMyRentals);

/** GET /api/rentals → All rentals with client info (admin/jefe_bodega) */
router.get('/', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA), RentalController.getAll);

export default router;
