/**
 * Modelo Sequelize para la tabla 'payment_transactions'.
 * Persiste cada transacción recibida via webhook de Wompi.
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type {
    IPaymentTransactionAttributes,
    IPaymentTransactionCreationAttributes,
} from '../interfaces/wompiInterfaces.js';

class PaymentTransaction
    extends Model<IPaymentTransactionAttributes, IPaymentTransactionCreationAttributes>
    implements IPaymentTransactionAttributes
{
    declare id: number;
    declare wompiId: string;
    declare reference: string;
    declare status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
    declare amountInCents: number;
    declare currency: string;
    declare paymentMethodType: string;
    declare statusMessage: string | null;
    declare environment: 'prod' | 'test';
    declare finalizedAt: Date | null;
    declare rawPayload: object;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

PaymentTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        wompiId: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'ID único de la transacción en Wompi',
        },
        reference: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Referencia de la orden enviada al widget',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'),
            allowNull: false,
            comment: 'Estado actual de la transacción',
        },
        amountInCents: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Monto en centavos',
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'COP',
        },
        paymentMethodType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'Tipo de método de pago (CARD, PSE, etc.)',
        },
        statusMessage: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        environment: {
            type: DataTypes.ENUM('prod', 'test'),
            allowNull: false,
            defaultValue: 'test',
        },
        finalizedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        rawPayload: {
            type: DataTypes.JSONB,
            allowNull: false,
            comment: 'Payload completo del webhook para auditoría',
        },
    },
    {
        sequelize,
        tableName: 'payment_transactions',
        timestamps: true,
        indexes: [
            { fields: ['wompi_id'], unique: true },
            { fields: ['reference'] },
            { fields: ['status'] },
        ],
    }
);

export default PaymentTransaction;
