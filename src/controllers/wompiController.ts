/**
 * Controller de Wompi
 * Expone los endpoints que el front y Wompi necesitan:
 *   - Generar firma de integridad para el widget
 *   - Recibir y verificar webhooks de Wompi
 *   - Consultar transacciones por ID
 */

import { Request, Response } from 'express';
import wompiService from '../services/wompiService.js';
import notificationService from '../services/notificationService.js';
import { Rental, Warehouse, RentalContract, RentalApplication } from '../models/index.js';
import type { IWompiWebhookEvent } from '../interfaces/wompiInterfaces.js';

/**
 * Activa el arrendamiento para una bodega tras un pago APPROVED.
 * Idempotente: si ya existe un Rental activo, no crea duplicados.
 * Retorna el Rental creado (o el existente si ya había uno).
 */
async function activateRental(warehouseId: number): Promise<{ rental: Rental | null; warehouseName: string; userId: number | null }> {
    const warehouse = await Warehouse.findByPk(warehouseId);
    const warehouseName = warehouse?.description ?? 'la bodega';

    const contract = await RentalContract.findOne({
        where: { warehouseId, status: 'SIGNED' },
        include: [{ model: RentalApplication, as: 'application' }],
    });

    if (!contract) return { rental: null, warehouseName, userId: null };

    const userId = contract.userId;

    // Idempotencia: si ya existe un rental activo, retornar sin duplicar
    const existing = await Rental.findOne({ where: { warehouseId, userId, status: 'ACTIVE' } });
    if (existing) return { rental: existing, warehouseName, userId };

    // Calcular fecha de fin según duración del contrato
    const app = (contract as any).application as RentalApplication | null;
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (app?.rentalDuration === 'SEMESTER') {
        endDate.setMonth(endDate.getMonth() + 6);
    } else if (app?.rentalDuration === 'ANNUAL') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const rental = await Rental.create({
        userId,
        warehouseId,
        monthlyAmount: warehouse?.monthlyPrice ?? 0,
        status: 'ACTIVE',
        startDate,
        endDate,
        warehouseCode: warehouse?.code ?? null,
    });

    await Warehouse.update({ isAvailable: false }, { where: { id: warehouseId } });

    console.log(`[Wompi] Rental creado y bodega ${warehouseId} deshabilitada para usuario ${userId}.`);

    return { rental, warehouseName, userId };
}

export const WompiController = {

    /**
     * POST /api/wompi/signature
     * El frontend llama a este endpoint ANTES de abrir el widget.
     * Genera y devuelve la firma de integridad + llave pública.
     *
     * Body: { reference, amountInCents, currency }
     */
    async generateSignature(req: Request, res: Response): Promise<void> {
        try {
            const { reference, amountInCents, currency } = req.body;

            if (!reference || !amountInCents || !currency) {
                res.status(400).json({ message: 'reference, amountInCents y currency son requeridos.' });
                return;
            }

            const result = wompiService.generateSignature({
                reference,
                amountInCents: Number(amountInCents),
                currency,
            });

            // Devolver todo lo que el widget necesita, incluyendo echo de reference y amountInCents
            res.status(200).json({
                ...result,
                reference,
                amountInCents: Number(amountInCents),
                currency,
            });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * POST /api/webhooks/wompi
     * Wompi llama a este endpoint cuando el estado de una transacción cambia.
     * Verifica la firma y procesa el evento.
     *
     * IMPORTANTE: Esta ruta debe ser pública (sin autenticación JWT).
     */
    async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            const event = req.body as IWompiWebhookEvent;

            if (!event?.data?.transaction) {
                res.status(400).json({ message: 'Payload inválido.' });
                return;
            }

            const { id, status, amount_in_cents } = event.data.transaction;
            const checksum = event.signature?.checksum;

            if (!checksum) {
                res.status(400).json({ message: 'Checksum faltante.' });
                return;
            }

            // Verificar que el evento es auténtico
            const valid = wompiService.verifyWebhookSignature(id, status, amount_in_cents, checksum);
            if (!valid) {
                res.status(401).json({ message: 'Firma del webhook inválida.' });
                return;
            }

            // Persistir / actualizar la transacción en BD
            await wompiService.persistTransaction(
                event.data.transaction,
                event.environment,
                event.data.transaction,
            );

            // ── Activar bodega y notificar según el estado del pago ──────────
            try {
                // La referencia tiene formato: LOGI-{warehouseId}-{timestamp}
                const parts = event.data.transaction.reference?.split('-');
                const warehouseId = parts && parts.length >= 2 ? parseInt(parts[1], 10) : null;

                if (warehouseId) {
                    if (status === 'APPROVED') {
                        const { warehouseName, userId } = await activateRental(warehouseId);
                        if (userId) {
                            await notificationService.notifyPaymentConfirmed(userId, warehouseName, amount_in_cents);
                        }
                    } else if (status === 'DECLINED' || status === 'ERROR') {
                        const warehouse = await Warehouse.findByPk(warehouseId);
                        const warehouseName = warehouse?.description ?? 'la bodega';
                        const rental = await Rental.findOne({ where: { warehouseId, status: 'ACTIVE' }, order: [['createdAt', 'DESC']] });
                        if (rental) await notificationService.notifyPaymentFailed(rental.userId, warehouseName);
                    }
                }
            } catch (notifErr) {
                console.error('[Wompi Webhook] Error procesando evento:', notifErr);
            }

            console.log(`[Wompi Webhook] Transacción ${id} → ${status} guardada en BD.`);
            res.status(200).json({ received: true });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/wompi/transactions/:id
     * Consulta el estado de una transacción directamente a Wompi.
     * Útil para confirmar un pago desde el backend.
     */
    async getTransaction(req: Request, res: Response): Promise<void> {
        try {
            const id = String(req.params.id);
            const transaction = await wompiService.getTransactionById(id);
            res.status(200).json(transaction);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * POST /api/wompi/simulate-payment  ← SOLO DEVELOPMENT
     * Simula un pago aprobado sin pasar por Wompi.
     * Útil para probar el flujo completo en local.
     *
     * Body: { warehouseId: number }
     */
    async simulatePayment(req: Request, res: Response): Promise<void> {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({ message: 'No disponible en producción.' });
            return;
        }
        try {
            const warehouseId = parseInt(req.body.warehouseId, 10);
            if (!warehouseId || isNaN(warehouseId)) {
                res.status(400).json({ message: 'warehouseId es requerido.' });
                return;
            }
            const { rental, warehouseName, userId } = await activateRental(warehouseId);
            if (!userId) {
                res.status(404).json({ message: 'No se encontró un contrato SIGNED para esta bodega.' });
                return;
            }
            res.status(200).json({ activated: true, rental, warehouseName, userId });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * POST /api/wompi/confirm-payment
     * El frontend llama a este endpoint al regresar del checkout de Wompi.
     * Verifica el estado de la transacción y activa el arrendamiento si APPROVED.
     * Es idempotente: puede llamarse múltiples veces sin crear duplicados.
     *
     * Body: { transactionId: string }
     */
    async confirmPayment(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId } = req.body;
            if (!transactionId) {
                res.status(400).json({ message: 'transactionId es requerido.' });
                return;
            }

            // Verificar estado real con Wompi
            const transaction = await wompiService.getTransactionById(String(transactionId));

            if (transaction.status !== 'APPROVED') {
                res.status(200).json({ activated: false, status: transaction.status });
                return;
            }

            // Parsear warehouseId de la referencia: LOGI-{warehouseId}-{timestamp}
            const parts = transaction.reference?.split('-');
            const warehouseId = parts && parts.length >= 2 ? parseInt(parts[1], 10) : null;

            if (!warehouseId || isNaN(warehouseId)) {
                res.status(422).json({ message: 'No se pudo identificar la bodega desde la referencia.' });
                return;
            }

            const { rental, warehouseName, userId } = await activateRental(warehouseId);

            if (userId) {
                await notificationService.notifyPaymentConfirmed(userId, warehouseName, transaction.amount_in_cents);
            }

            res.status(200).json({ activated: true, status: 'APPROVED', rental });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },
};
