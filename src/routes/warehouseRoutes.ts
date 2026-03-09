import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouseController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Protected routes
router.get('/', authenticate, WarehouseController.getAll);
router.post('/', authenticate, WarehouseController.create);

export default router;
