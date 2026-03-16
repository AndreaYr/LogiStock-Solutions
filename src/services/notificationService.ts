/**
 * Servicio de Notificaciones
 * Centraliza la lógica de creación de notificaciones para todos los eventos del sistema.
 * Los controladores/servicios llaman a este servicio cuando ocurre un evento relevante.
 */

import notificationRepo from '../repositories/notificationRepositories.js';
import { UserRepository } from '../repositories/userRepositories.js';
import { sendNotificationEmail } from './emailService.js';
import type { NotificationType } from '../models/notificationModel.js';
import Role from '../models/roleModel.js';
import User from '../models/userModel.js';

const userRepo = new UserRepository();

class NotificationService {

    /** Crea una notificación y envía un email al usuario */
    async create(userId: number, type: NotificationType, title: string, message: string) {
        // Guardar en base de datos
        const notification = await notificationRepo.createForUser({ userId, type, title, message });

        // Enviar email (no bloquea la respuesta si falla)
        userRepo.findById(userId).then(user => {
            if (user && user.email) {
                console.log(`[NotificationService] Intentando enviar email a ${user.email} (Evento: ${type})`);
                sendNotificationEmail(user.email, user.firstName, title, message).then(() => {
                    console.log(`[NotificationService] Email enviado con éxito a ${user.email}`);
                }).catch(err => {
                    console.error(`[NotificationService] ❌ ERROR enviando email a ${user.email}:`, err);
                });
            }
        }).catch(err => {
            console.error(`[NotificationService] Error buscando usuario ${userId} para email:`, err);
        });

        return notification;
    }

    /** Retorna las últimas N notificaciones del usuario */
    async getForUser(userId: number, limit = 20) {
        return notificationRepo.findByUser(userId, limit);
    }

    /** Retorna el número de notificaciones no leídas (para el badge del ícono) */
    async getUnreadCount(userId: number) {
        return notificationRepo.countUnread(userId);
    }

    /** Marca una notificación como leída */
    async markAsRead(notificationId: number, userId: number) {
        const updated = await notificationRepo.markAsRead(notificationId, userId);
        if (!updated) throw new Error('Notificación no encontrada.');
    }

    /** Marca todas las notificaciones del usuario como leídas */
    async markAllAsRead(userId: number) {
        await notificationRepo.markAllAsRead(userId);
    }

    // ─── Helpers de eventos del negocio ───────────────────────────────────────

    /** Llamar cuando Wompi confirma un pago exitoso */
    async notifyPaymentConfirmed(userId: number, warehouseName: string, amount: number) {
        const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount / 100);
        return this.create(
            userId,
            'payment_confirmed',
            'Pago confirmado',
            `El pago de ${formatted} para el alquiler de ${warehouseName} fue confirmado.`
        );
    }

    /** Llamar cuando Wompi rechaza o falla un pago */
    async notifyPaymentFailed(userId: number, warehouseName: string) {
        return this.create(
            userId,
            'payment_failed',
            'Pago rechazado',
            `El pago del alquiler de ${warehouseName} no fue procesado. Intenta de nuevo.`
        );
    }

    /** Llamar cuando se crea un nuevo alquiler */
    async notifyRentalCreated(userId: number, warehouseName: string) {
        return this.create(
            userId,
            'rental_created',
            'Bodega alquilada',
            `Tu alquiler de ${warehouseName} ha sido registrado exitosamente.`
        );
    }

    /** Llamar cuando la capacidad de una bodega supera el 90% */
    async notifyCapacityAlert(userId: number, warehouseName: string, capacityPercent: number) {
        return this.create(
            userId,
            'capacity_alert',
            'Alerta de capacidad',
            `${warehouseName} ha alcanzado el ${capacityPercent}% de su capacidad.`
        );
    }

    /** Llamar cuando un usuario inicia sesión */
    async notifyLogin(userId: number, ipAddress: string) {
        return this.create(
            userId,
            'login_detected',
            'Inicio de sesión detectado',
            `Se detectó un acceso a tu cuenta desde la IP ${ipAddress}.`
        );
    }

    /** Llamar cuando un nuevo usuario se registra */
    async notifyUserRegistered(userId: number, firstName: string) {
        return this.create(
            userId,
            'user_registered',
            '¡Bienvenido a LogiStock!',
            `Hola ${firstName}, tu cuenta ha sido creada exitosamente. Explora nuestras bodegas disponibles.`
        );
    }

    /** Llamar cuando el cliente envía una solicitud de arrendamiento */
    async notifyApplicationSubmitted(userId: number, warehouseName: string) {
        return this.create(
            userId,
            'application_submitted',
            'Solicitud recibida',
            `Tu solicitud para arrendar "${warehouseName}" fue enviada exitosamente. El equipo la revisará pronto.`
        );
    }

    /** Llamar cuando el admin aprueba una solicitud */
    async notifyApplicationApproved(userId: number, warehouseName: string) {
        return this.create(
            userId,
            'application_approved',
            '¡Solicitud aprobada!',
            `Tu solicitud para arrendar "${warehouseName}" fue aprobada. Ya puedes proceder con la firma del contrato.`
        );
    }

    /** Llamar cuando el admin rechaza una solicitud */
    async notifyApplicationRejected(userId: number, warehouseName: string, reason: string) {
        return this.create(
            userId,
            'application_rejected',
            'Solicitud rechazada',
            `Tu solicitud para arrendar "${warehouseName}" fue rechazada. Motivo: ${reason}`
        );
    }

    /** Llamar cuando OFAC/ONU marca al solicitante */
    async notifyApplicationFlagged(userId: number, warehouseName: string) {
        return this.create(
            userId,
            'application_flagged',
            'Solicitud no procesada',
            `Tu solicitud para arrendar "${warehouseName}" no pudo ser procesada. Comunícate con soporte para más información.`
        );
    }

    /** Llamar cuando hay un movimiento de inventario */
    async notifyMovement(userId: number, type: 'entrada' | 'salida' | 'traslado', product: string, quantity: number, warehouse: string) {
        let msg = '';
        const title = type === 'entrada' ? 'Nueva entrada registrada' : type === 'salida' ? 'Salida completada' : 'Traslado realizado';

        if (type === 'entrada') msg = `Se registró una entrada de ${quantity} unidades de "${product}" en ${warehouse}.`;
        else if (type === 'salida') msg = `Se completó la salida de ${quantity} unidades de "${product}" desde ${warehouse}.`;
        else msg = `Se realizó un traslado de ${quantity} unidades de "${product}".`;

        return this.create(userId, 'inventory_movement', title, msg);
    }

    /** Notifica a todos los usuarios con rol admin */
    async notifyAllAdmins(type: NotificationType, title: string, message: string): Promise<void> {
        try {
            const adminRole = await Role.findOne({ where: { name: 'admin' } });
            if (!adminRole) return;
            const admins = await User.findAll({ where: { roleId: adminRole.id, isActive: true } });
            await Promise.all(admins.map(admin => this.create(admin.id, type, title, message)));
        } catch (err) {
            console.error('[NotificationService] Error notificando admins:', err);
        }
    }
}

export default new NotificationService();
