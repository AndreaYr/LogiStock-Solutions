/**
 * Controller de Wompi
 * Expone los endpoints que el front y Wompi necesitan:
 *   - Generar firma de integridad para el widget
 *   - Recibir y verificar webhooks de Wompi
 *   - Consultar transacciones por ID
 */

import { Request, Response } from 'express';
import wompiService from '../services/wompiService.js';
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

            res.status(200).json(result);
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
