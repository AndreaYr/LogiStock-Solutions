import { Router } from 'express';
import { RentalApplicationController } from '../controllers/rentalApplicationController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/** POST /api/rental-applications — Cliente envía su solicitud de estudio */
router.post('/', RentalApplicationController.submit);

/** GET /api/rental-applications/my — Cliente consulta sus propias solicitudes */
router.get('/my', RentalApplicationController.getMy);

/** GET /api/rental-applications — Admin lista todas las solicitudes */
router.get('/', authorize(UserRole.ADMIN), RentalApplicationController.getAll);

/** GET /api/rental-applications/:id — Admin consulta una solicitud por ID */
router.get('/:id', authorize(UserRole.ADMIN), RentalApplicationController.getById);

/** PATCH /api/rental-applications/:id/approve — Admin aprueba una solicitud */
router.patch('/:id/approve', authorize(UserRole.ADMIN), RentalApplicationController.approve);

/** PATCH /api/rental-applications/:id/reject — Admin rechaza una solicitud con motivo */
router.patch('/:id/reject', authorize(UserRole.ADMIN), RentalApplicationController.reject);

export default router;
