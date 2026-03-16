/**
 * Rutas de usuarios
 * Todas requieren JWT (authenticate).
 *
 * GET    /api/users        → solo ADMIN
 * GET    /api/users/me     → perfil propio
 * GET    /api/users/:id    → propio o ADMIN
 * PUT    /api/users/:id    → propio o ADMIN
 * PATCH  /api/users/:id/password → solo el propio usuario
 * DELETE /api/users/:id    → solo ADMIN
 */

import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Todos los endpoints de usuarios requieren estar autenticado
router.use(authenticate);

router.get('/',                         authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA),                       UserController.findAll);
router.get('/me',                                                                         UserController.me);
router.get('/:id',                                                                        UserController.findById);
router.put('/:id',                                                                        UserController.updateProfile);
router.patch('/:id/password',                                                             UserController.changePassword);
router.delete('/:id',                   authorize(UserRole.ADMIN),                       UserController.deactivate);

export default router;
