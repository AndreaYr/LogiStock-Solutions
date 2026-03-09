import { Request, Response } from 'express';
import notificationService from '../services/notificationService.js';

export const NotificationController = {

    /** GET /api/notifications → Notificaciones del usuario autenticado */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user!;
            const limit = parseInt(String(req.query.limit ?? '20'), 10);
            const notifications = await notificationService.getForUser(userId, limit);
            res.status(200).json(notifications);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/notifications/unread-count → Número de notificaciones no leídas */
    async getUnreadCount(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user!;
            const count = await notificationService.getUnreadCount(userId);
            res.status(200).json({ count });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** PATCH /api/notifications/:id/read → Marcar una notif como leída */
    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user!;
            const id = parseInt(String(req.params.id), 10);
            await notificationService.markAsRead(id, userId);
            res.status(200).json({ message: 'Notificación marcada como leída.' });
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /** PATCH /api/notifications/read-all → Marcar todas como leídas */
    async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user!;
            await notificationService.markAllAsRead(userId);
            res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas.' });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },
};
