/**
 * Rutas de roles
 * Solo ADMIN puede consultar los roles del sistema.
 *
 * GET /api/roles
 * GET /api/roles/:id
 */

import { Router } from 'express';
import { RoleController } from '../controllers/roleController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/',    RoleController.findAll);
router.get('/:id', RoleController.findById);

export default router;
