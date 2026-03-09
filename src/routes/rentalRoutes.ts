import { Router } from 'express';
import { RentalController } from '../controllers/rentalController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Authenticated routes
router.use(authenticate);

/** GET /api/rentals/me → User's rented warehouses */
router.get('/me', RentalController.getMyRentals);

export default router;
