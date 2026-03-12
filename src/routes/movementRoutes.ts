import { Router } from 'express';
import { MovementController } from '../controllers/movementController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

/**
 * Rutas de movimientos de inventario
 * Requieren autenticación.
 */
router.use(authenticate);

/** POST /api/movements → Registrar entrada/salida (Solo Staff: Admin, Warehouse Manager, Assistant) */
router.post('/', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR), MovementController.create);

/** GET /api/movements → Listar historial (permite query params como warehouseId) */
router.get('/', MovementController.list);

/** GET /api/movements/warehouse/:id → Historial de una bodega */
router.get('/warehouse/:id', MovementController.getByWarehouse);

export default router;
