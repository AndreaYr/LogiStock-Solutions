import { BaseRepository } from './baseRepositories.js';
import Notification from '../models/notificationModel.js';
import type { NotificationType } from '../models/notificationModel.js';

export class NotificationRepository extends BaseRepository<Notification> {
    constructor() {
        super(Notification);
    }

    /** Crea una nueva notificación para un usuario */
    async createForUser(data: {
        userId: number;
        type: NotificationType;
        title: string;
        message: string;
    }): Promise<Notification> {
        return this.model.create({ ...data, isRead: false });
    }

    /** Obtiene las notificaciones de un usuario, las más recientes primero */
    async findByUser(userId: number, limit = 20): Promise<Notification[]> {
        return this.model.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
        });
    }

    /** Cuenta las notificaciones no leídas de un usuario */
    async countUnread(userId: number): Promise<number> {
        return this.model.count({ where: { userId, isRead: false } });
    }

    /** Marca una notificación como leída */
    async markAsRead(id: number, userId: number): Promise<boolean> {
        const [count] = await this.model.update(
            { isRead: true },
            { where: { id, userId } }
        );
        return count > 0;
    }

    /** Marca todas las notificaciones de un usuario como leídas */
    async markAllAsRead(userId: number): Promise<void> {
        await this.model.update({ isRead: true }, { where: { userId, isRead: false } });
    }
}

export default new NotificationRepository();
