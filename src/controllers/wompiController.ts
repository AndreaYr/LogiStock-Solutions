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

                let warehouseName = 'la bodega';
                let rentalUserId: number | null = null;

                if (warehouseId) {
                    const warehouse = await Warehouse.findByPk(warehouseId);
                    if (warehouse) warehouseName = warehouse.description;

                    // Buscar el contrato FIRMADO para identificar al cliente
                    const contract = await RentalContract.findOne({
                        where: { warehouseId, status: 'SIGNED' },
                        include: [{ model: RentalApplication, as: 'application' }],
                    });

                    if (contract) {
                        rentalUserId = contract.userId;

                        if (status === 'APPROVED') {
                            // Idempotencia: evitar duplicados si el webhook llega más de una vez
                            const existingRental = await Rental.findOne({
                                where: { warehouseId, userId: contract.userId, status: 'ACTIVE' },
                            });

                            if (!existingRental) {
                                // Calcular fecha de fin según duración del contrato
                                const app = (contract as any).application as RentalApplication | null;
                                const startDate = new Date();
                                const endDate = new Date(startDate);

                                if (app?.rentalDuration === 'SEMESTER') {
                                    endDate.setMonth(endDate.getMonth() + 6);
                                } else if (app?.rentalDuration === 'ANNUAL') {
                                    endDate.setFullYear(endDate.getFullYear() + 1);
                                } else {
                                    // MONTHLY por defecto
                                    endDate.setMonth(endDate.getMonth() + 1);
                                }

                                // Crear el registro de arrendamiento activo
                                await Rental.create({
                                    userId: contract.userId,
                                    warehouseId,
                                    monthlyAmount: warehouse ? warehouse.monthlyPrice : 0,
                                    status: 'ACTIVE',
                                    startDate,
                                    endDate,
                                });

                                // Deshabilitar la bodega para otros clientes
                                await Warehouse.update(
                                    { isAvailable: false },
                                    { where: { id: warehouseId } }
                                );

                                console.log(
                                    `[Wompi Webhook] Rental creado y bodega ${warehouseId} deshabilitada para usuario ${contract.userId}.`
                                );
                            }
                        }
                    } else {
                        // Fallback: si no hay contrato SIGNED, buscar rental activo existente
                        const rental = await Rental.findOne({
                            where: { warehouseId, status: 'ACTIVE' },
                            order: [['createdAt', 'DESC']],
                        });
                        if (rental) rentalUserId = rental.userId;
                    }
                }

                if (rentalUserId) {
                    if (status === 'APPROVED') {
                        await notificationService.notifyPaymentConfirmed(
                            rentalUserId,
                            warehouseName,
                            amount_in_cents
                        );
                    } else if (status === 'DECLINED' || status === 'ERROR') {
                        await notificationService.notifyPaymentFailed(rentalUserId, warehouseName);
                    }
                }
            } catch (notifErr) {
                // Las notificaciones no deben interrumpir la respuesta al webhook
                console.error('[Wompi Webhook] Error generando notificación:', notifErr);
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
};
