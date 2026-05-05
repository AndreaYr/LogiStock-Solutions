import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { WarehouseController } from '../controllers/warehouseController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { UserRole } from '../interfaces/interfaces.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.resolve(__dirname, '../../uploads/warehouses'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `warehouse-${req.params.id ?? 'new'}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const router = Router();

router.get('/',        authenticate, WarehouseController.getAll);
router.get('/:id',     authenticate, WarehouseController.getById);
router.post('/',       authenticate, authorize(UserRole.ADMIN), WarehouseController.create);
router.put('/:id',     authenticate, authorize(UserRole.ADMIN), WarehouseController.update);
router.patch('/:id/toggle-status', authenticate, authorize(UserRole.ADMIN), WarehouseController.toggleStatus);
router.delete('/:id',  authenticate, authorize(UserRole.ADMIN), WarehouseController.remove);
router.post('/:id/images', authenticate, authorize(UserRole.ADMIN), upload.array('images', 10), WarehouseController.uploadImages);

export default router;
