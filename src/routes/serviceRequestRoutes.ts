import { Router } from 'express';
import { ServiceRequestController } from '../controllers/serviceRequestController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * Listar todas las solicitudes del sistema (sin filtro de bodega)
 * Roles permitidos: admin, jefe_bodega, auxiliar, operador (para ver órdenes del día)
 */
router.get('/all', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR, UserRole.OPERADOR), ServiceRequestController.getAllRequests);
router.get('/availability', ServiceRequestController.getAvailability);

/**
 * Listar TODAS las solicitudes del cliente autenticado (sin filtro de bodega)
 * Roles permitidos: todos
 */
router.get('/me', ServiceRequestController.getMine);

/**
 * Listar solicitudes de una bodega
 * Roles permitidos: client (solo ve las suyas), admin, jefe_bodega, auxiliar
 */
router.get('/', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR, UserRole.CLIENTE), ServiceRequestController.getAll);

/**
 * Obtener una solicitud por ID
 * Roles permitidos: todos (autenticados)
 */
router.get('/:id', ServiceRequestController.getById);

/**
 * Crear solicitud (Ingreso, Retiro, Cancelación)
 * Roles permitidos: client
 */
router.post('/', authorize(UserRole.CLIENTE), ServiceRequestController.create);

/**
 * Actualizar estado de solicitud (Aprobar, Rechazar, Completar)
 * Roles permitidos: admin, jefe_bodega, auxiliar, operador (para actualizar sus órdenes a IN_PROGRESS o COMPLETED)
 */
router.patch('/:id', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR, UserRole.OPERADOR), ServiceRequestController.updateStatus);

/**
 * Asignar un auxiliar a una orden aprobada
 * Roles permitidos: admin, jefe_bodega, auxiliar (para auto-asignarse)
 */
router.patch('/:id/assign-auxiliary', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.AUXILIAR), ServiceRequestController.assignAuxiliary);

export default router;
