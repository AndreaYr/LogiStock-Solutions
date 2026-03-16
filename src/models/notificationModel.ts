import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Tipos de notificaciones que el sistema puede generar.
 */
export type NotificationType =
    | 'payment_confirmed'   // Pago de alquiler confirmado por Wompi
    | 'payment_failed'      // Pago rechazado
    | 'rental_created'      // Nuevo alquiler creado
    | 'rental_expired'      // Alquiler próximo a vencer o vencido
    | 'capacity_alert'      // Bodega superó el 90% de capacidad
    | 'login_detected'      // Inicio de sesión detectado
    | 'user_registered'     // Nuevo usuario registrado
    | 'inventory_movement'  // Entrada, salida o traslado de productos
    | 'application_submitted'  // Cliente envió solicitud de arrendamiento
    | 'application_approved'   // Admin aprobó la solicitud
    | 'application_rejected'   // Admin rechazó la solicitud
    | 'application_flagged'    // Solicitud marcada por OFAC/ONU
    | 'system';             // Mensaje del sistema / admin

export interface INotificationAttributes {
    id: number;
    userId: number;                 // FK → users.id (a quién va dirigida)
    type: NotificationType;         // Categoria de la notificación
    title: string;                  // Título corto (ej. "Pago confirmado")
    message: string;                // Descripción detallada
    isRead: boolean;                // Si el usuario ya la vio
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotificationCreationAttributes
    extends Optional<INotificationAttributes, 'id' | 'isRead'> { }

export interface INotification
    extends Model<INotificationAttributes, INotificationCreationAttributes>,
    INotificationAttributes { }

class Notification
    extends Model<INotificationAttributes, INotificationCreationAttributes>
    implements INotification {
    declare id: number;
    declare userId: number;
    declare type: NotificationType;
    declare title: string;
    declare message: string;
    declare isRead: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Notification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
        },
        type: {
            type: DataTypes.ENUM(
                'payment_confirmed',
                'payment_failed',
                'rental_created',
                'rental_expired',
                'capacity_alert',
                'login_detected',
                'user_registered',
                'inventory_movement',
                'application_submitted',
                'application_approved',
                'application_rejected',
                'application_flagged',
                'system'
            ),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['is_read'] },
        ],
    }
);

export default Notification;
