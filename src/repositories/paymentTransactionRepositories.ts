/**
 * Repositorio para la tabla 'payment_transactions'.
 * Gestiona la persistencia de transacciones recibidas vía webhook de Wompi.
 */

import { Op } from 'sequelize';
import { BaseRepository } from './baseRepositories.js';
import PaymentTransaction from '../models/paymentTransactionModel.js';

export class PaymentTransactionRepository extends BaseRepository<PaymentTransaction> {
    constructor() {
        super(PaymentTransaction);
    }

    /** Busca una transacción por su ID de Wompi (wompiId) */
    async findByWompiId(wompiId: string): Promise<PaymentTransaction | null> {
        return this.model.findOne({ where: { wompiId } });
    }

    /** Busca todas las transacciones de una referencia de orden */
    async findByReference(reference: string): Promise<PaymentTransaction[]> {
        return this.model.findAll({
            where: { reference },
            order: [['createdAt', 'DESC']],
        });
    }

    /** Inserta o actualiza una transacción por wompiId (upsert) */
    async upsert(data: {
        wompiId: string;
        reference: string;
        status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
        amountInCents: number;
        currency: string;
        paymentMethodType: string;
        statusMessage: string | null;
        environment: 'prod' | 'test';
        finalizedAt: Date | null;
        rawPayload: object;
    }): Promise<PaymentTransaction> {
        const existing = await this.findByWompiId(data.wompiId);

        if (existing) {
            await existing.update(data);
            return existing;
        }

        return this.model.create(data);
    }

    /** Retorna las últimas transacciones APPROVED para auditoría */
    async findApproved(limit = 50): Promise<PaymentTransaction[]> {
        return this.model.findAll({
            where: { status: 'APPROVED' },
            order: [['createdAt', 'DESC']],
            limit,
        });
    }
}

export default new PaymentTransactionRepository();
