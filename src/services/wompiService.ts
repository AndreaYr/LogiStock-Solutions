/**
 * Servicio de Wompi
 * Centraliza la lógica de integración con la pasarela de pago Wompi.
 *
 * Responsabilidades:
 * - Generar la firma de integridad requerida por el widget de Wompi
 * - Verificar la firma de los eventos webhook enviados por Wompi
 * - Consultar el estado de una transacción vía API REST de Wompi
 */

import { createHash } from 'crypto';
import { env } from '../config/env.js';
import paymentTransactionRepo from '../repositories/paymentTransactionRepositories.js';
import type { IWompiSignatureRequest, IWompiSignatureResponse, IWompiTransaction, IWompiWebhookEvent } from '../interfaces/wompiInterfaces.js';

const WOMPI_API_BASE = 'https://production.wompi.co/v1';
const WOMPI_SANDBOX_BASE = 'https://sandbox.wompi.co/v1';

class WompiService {

    /** 
     * true cuando se usa ambiente de producción de Wompi.
     * 
     * IMPORTANTE: Para proyectos académicos/demo que simularán pagos sin transacciones reales,
     * set WOMPI_USE_TEST=true en el .env para forzar uso de credenciales de test/sandbox
     * incluso en producción (NODE_ENV=production).
     * 
     * Lógica:
     * - Si WOMPI_USE_TEST=true → Usa credenciales TEST (sandbox.wompi.co)
     * - Si WOMPI_USE_TEST=false/undefined Y NODE_ENV=production → Usa credenciales PROD
     * - Si NODE_ENV != production → Usa credenciales TEST
     */
    private get isProduction(): boolean {
        // Fuerza TEST si WOMPI_USE_TEST está explícitamente activado
        if (env.WOMPI_USE_TEST === 'true') {
            return false;
        }
        // De lo contrario, decide por NODE_ENV
        return env.NODE_ENV === 'production';
    }

    /** URL base de la API de Wompi según el entorno */
    private get apiBase(): string {
        return this.isProduction ? WOMPI_API_BASE : WOMPI_SANDBOX_BASE;
    }

    /** Set de llaves activo — nunca se mezclan prod y test */
    private get keys() {
        if (this.isProduction) {
            return {
                publicKey:       env.WOMPI_PUBLIC_KEY,
                privateKey:      env.WOMPI_PRIVATE_KEY,
                integritySecret: env.WOMPI_INTEGRITY_SECRET,
                eventsSecret:    env.WOMPI_EVENTS_SECRET,
            };
        }
        return {
            publicKey:       env.WOMPI_TEST_PUBLIC_KEY,
            privateKey:      env.WOMPI_TEST_PRIVATE_KEY,
            integritySecret: env.WOMPI_TEST_INTEGRITY_SECRET,
            eventsSecret:    env.WOMPI_TEST_EVENTS_SECRET,
        };
    }

    /**
     * Genera la firma de integridad (integrity hash) que el widget de Wompi requiere.
     * La cadena a hashear es: `{reference}{amountInCents}{currency}{integritySecret}`
     * Se calcula en el servidor para proteger el secreto de integridad.
     *
     * @param data Referencia, monto en centavos y moneda del pago
     * @returns Firma SHA-256 y llave pública para el widget
     */
    generateSignature(data: IWompiSignatureRequest): IWompiSignatureResponse {
        const { reference, amountInCents, currency } = data;
        const { integritySecret, publicKey } = this.keys;

        const chain = `${reference}${amountInCents}${currency}${integritySecret}`;
        const signature = createHash('sha256').update(chain).digest('hex');

        return {
            signature,
            publicKey, // siempre corresponde al mismo entorno que integritySecret
        };
    }

    /**
     * Verifica que un evento webhook proviene realmente de Wompi.
     */
    verifyWebhookSignature(
        transactionId: string,
        status: string,
        amountInCents: number,
        receivedChecksum: string,
    ): boolean {
        const chain = `${transactionId}${status}${amountInCents}${this.keys.eventsSecret}`;
        const expectedChecksum = createHash('sha256').update(chain).digest('hex');
        return expectedChecksum === receivedChecksum;
    }

    /**
     * Consulta el estado actual de una transacción en la API de Wompi.
     * Útil para verificar pagos de forma activa (polling) desde el backend.
     *
     * @param transactionId ID de la transacción devuelto por el widget
     * @returns Objeto de transacción con su estado actual
     */
    async getTransactionById(transactionId: string): Promise<IWompiTransaction> {
        const url = `${this.apiBase}/transactions/${transactionId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.keys.privateKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error consultando transacción Wompi: ${response.status} ${response.statusText}`);
        }

        const body = await response.json() as { data: IWompiTransaction };
        return body.data;
    }

    /**
     * Persiste o actualiza una transacción de Wompi recibida por webhook.
     * Usa upsert por wompiId para manejar eventos duplicados de forma segura.
     *
     * @param tx  Datos de la transacción del webhook
     * @param env Entorno del evento ('prod' | 'test')
     * @param raw Payload completo del evento para auditoría
     */
    async persistTransaction(
        tx: IWompiTransaction,
        environment: 'prod' | 'test',
        raw: object
    ) {
        return paymentTransactionRepo.upsert({
            wompiId:           tx.id,
            reference:         tx.reference,
            status:            tx.status,
            amountInCents:     tx.amount_in_cents,
            currency:          tx.currency,
            paymentMethodType: tx.payment_method_type,
            statusMessage:     tx.status_message,
            environment,
            finalizedAt:       tx.finalized_at ? new Date(tx.finalized_at) : null,
            rawPayload:        raw,
        });
    }
}

export default new WompiService();
