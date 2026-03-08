import { Router } from 'express';
import bodegaController from '../controllers/bodegaController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de bodegas requieren autenticación
router.use(authenticate);

// Listar bodegas
router.get('/', bodegaController.getAll);

// Crear bodega (podría requerir un validator y rol de MANAGER o ADMIN en el futuro)
router.post('/', bodegaController.create);

export default router;
