import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/** GET  /api/notifications              → List user notifications */
router.get('/', NotificationController.getAll);

/** GET  /api/notifications/unread-count → Badge count */
router.get('/unread-count', NotificationController.getUnreadCount);

/** PATCH /api/notifications/read-all    → Mark all as read */
router.patch('/read-all', NotificationController.markAllAsRead);

/** PATCH /api/notifications/:id/read   → Mark one as read */
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
