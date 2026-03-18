/**
 * Servicio de Notificaciones
 * Centraliza la lógica de creación de notificaciones para todos los eventos del sistema.
 * Los controladores/servicios llaman a este servicio cuando ocurre un evento relevante.
 */

import notificationRepo from '../repositories/notificationRepositories.js';
import { UserRepository } from '../repositories/userRepositories.js';
import { sendNotificationEmail } from './emailService.js';
import type { NotificationType } from '../models/notificationModel.js';

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

    /** Llamar cuando hay un movimiento de inventario */
    async notifyMovement(userId: number, type: 'entrada' | 'salida' | 'traslado', product: string, quantity: number, warehouse: string) {
        let msg = '';
        const title = type === 'entrada' ? 'Nueva entrada registrada' : type === 'salida' ? 'Salida completada' : 'Traslado realizado';

        if (type === 'entrada') msg = `Se registró una entrada de ${quantity} unidades de "${product}" en ${warehouse}.`;
        else if (type === 'salida') msg = `Se completó la salida de ${quantity} unidades de "${product}" desde ${warehouse}.`;
        else msg = `Se realizó un traslado de ${quantity} unidades de "${product}".`;

        return this.create(userId, 'inventory_movement', title, msg);
    }

    /**
     * Notificar a todos los jefes de bodega sobre una nueva solicitud de servicio.
     * Se llama cuando un cliente crea una nueva solicitud (Ingreso, Retiro, Cancelación).
     */
    async notifyNewServiceRequest(
        clientName: string,
        warehouseName: string,
        requestType: 'INBOUND' | 'OUTBOUND' | 'CANCELLATION',
        product: string | null,
        quantity: number | null
    ) {
        // Obtener todos los usuarios con rol jefe_bodega o admin
        const { User, Role } = require('../models/index.js');
        
        try {
            const staffUsers = await User.findAll({
                include: [{
                    association: 'role',
                    where: {}
                }]
            });

            // Filtrar por jefe_bodega o admin
            const typeLabel = requestType === 'INBOUND' ? 'Ingreso'
                : requestType === 'OUTBOUND' ? 'Retiro'
                : 'Cancelación';
            
            const productInfo = product ? ` de "${product}" (${quantity} unidades)` : '';
            const title = `📥 Nueva solicitud de ${typeLabel}`;
            const message = `${clientName} ha solicitado un ${typeLabel.toLowerCase()}${productInfo} en ${warehouseName}.`;

            for (const staff of staffUsers) {
                const staffRole = (staff as any).role?.name?.toLowerCase() ?? '';
                const isManager = staffRole.includes('jefe') || staffRole.includes('admin');

                if (isManager) {
                    console.log(`[NotificationService] 📬 Notificando nuevo service request a ${staffRole} (userId=${staff.id})`);
                    try {
                        await this.create(
                            staff.id,
                            'system',
                            title,
                            message
                        );
                    } catch (err) {
                        console.error(`[NotificationService] Error notificando a ${staffRole} (userId=${staff.id}):`, err);
                    }
                }
            }
        } catch (err) {
            console.error(`[NotificationService] Error obteniendo jefes de bodega:`, err);
        }
    }
}

export default new NotificationService();
