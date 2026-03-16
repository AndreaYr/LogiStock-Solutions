import { Router } from 'express';
import { RentalContractController } from '../controllers/rentalContractController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const router = Router();

router.use(authenticate);

/** POST /api/contracts/generate/:applicationId — Admin genera el contrato */
router.post('/generate/:applicationId', authorize(UserRole.ADMIN), RentalContractController.generate);

/** GET /api/contracts/my — Cliente consulta sus contratos */
router.get('/my', RentalContractController.getMy);

/** GET /api/contracts — Admin lista todos los contratos */
router.get('/', authorize(UserRole.ADMIN), RentalContractController.getAll);

/** GET /api/contracts/:id — Detalle del contrato */
router.get('/:id', RentalContractController.getById);

/** GET /api/contracts/:id/download — Descarga el PDF */
router.get('/:id/download', RentalContractController.download);

/** POST /api/contracts/:id/client-sign — Cliente firma */
router.post('/:id/client-sign', RentalContractController.clientSign);

/** POST /api/contracts/:id/admin-sign — Admin firma */
router.post('/:id/admin-sign', authorize(UserRole.ADMIN), RentalContractController.adminSign);

export default router;
