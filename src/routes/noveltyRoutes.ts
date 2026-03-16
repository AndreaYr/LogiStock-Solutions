import { Router } from 'express';
import { NoveltyController } from '../controllers/noveltyController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Todas las rutas de novedades requieren autenticación
router.use(authenticate);

/**
 * Listar novedades de una bodega
 * Roles permitidos: client, admin, jefe_bodega, auxiliar
 */
router.get('/', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR, UserRole.CLIENTE), NoveltyController.getAll);

/**
 * Crear novedad
 * Roles permitidos: auxiliar, jefe_bodega
 */
router.post('/', authorize(UserRole.JEFE_BODEGA, UserRole.AUXILIAR), NoveltyController.create);

/**
 * Actualizar estado de novedad
 * Roles permitidos: admin, jefe_bodega
 */
router.patch('/:id', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA), NoveltyController.updateStatus);

export default router;
