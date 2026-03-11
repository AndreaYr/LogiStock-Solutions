import { Router } from 'express';
import { ServiceRequestController } from '../controllers/serviceRequestController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * Listar solicitudes de una bodega
 * Roles permitidos: client (solo ve las suyas), admin, jefe_bodega, auxiliar
 */
router.get('/', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR, UserRole.CLIENTE), ServiceRequestController.getAll);

/**
 * Crear solicitud (Ingreso, Retiro, Cancelación)
 * Roles permitidos: client
 */
router.post('/', authorize(UserRole.CLIENTE), ServiceRequestController.create);

/**
 * Actualizar estado de solicitud (Aprobar, Rechazar, Completar)
 * Roles permitidos: admin, jefe_bodega
 */
router.patch('/:id', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA), ServiceRequestController.updateStatus);

export default router;
