import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/reports/movements-period
 * Obtener movimientos en un período de tiempo
 * Roles permitidos: admin, jefe_bodega
 */
router.get('/movements-period', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA), ReportController.getMovementsByPeriod);

/**
 * GET /api/reports/warehouse-occupancy
 * Obtener ocupación actual de una bodega
 * Roles permitidos: admin, jefe_bodega, cliente
 */
router.get('/warehouse-occupancy', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.CLIENTE), ReportController.getWarehouseOccupancy);

/**
 * GET /api/reports/service-request-tracking/:requestId
 * Obtener tracking de una solicitud
 * Roles permitidos: admin, jefe_bodega, cliente (solo la suya), auxiliar (si está asignado)
 */
router.get('/service-request-tracking/:requestId', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA, UserRole.CLIENTE, UserRole.AUXILIAR), ReportController.getServiceRequestTracking);

/**
 * GET /api/reports/warehouse-kpis
 * Obtener KPIs de una bodega
 * Roles permitidos: admin, jefe_bodega
 */
router.get('/warehouse-kpis', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA), ReportController.getWarehouseKPIs);

/**
 * GET /api/reports/manager-actions
 * Obtener historial de acciones del jefe de bodega
 * Roles permitidos: admin, jefe_bodega
 */
router.get('/manager-actions', authorize(UserRole.ADMIN, UserRole.JEFE_BODEGA), ReportController.getManagerActionHistory);

export default router;
