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
import type { IWompiSignatureRequest, IWompiSignatureResponse, IWompiTransaction } from '../interfaces/wompiInterfaces.js';

const WOMPI_API_BASE = 'https://production.wompi.co/v1';
const WOMPI_SANDBOX_BASE = 'https://sandbox.wompi.co/v1';

class WompiService {

    private get apiBase(): string {
        return env.NODE_ENV === 'production' ? WOMPI_API_BASE : WOMPI_SANDBOX_BASE;
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

        const chain = `${reference}${amountInCents}${currency}${env.WOMPI_INTEGRITY_SECRET}`;
        const signature = createHash('sha256').update(chain).digest('hex');

        return {
            signature,
            publicKey: env.WOMPI_PUBLIC_KEY,
        };
    }

    /**
     * Verifica que un evento webhook proviene realmente de Wompi.
     * Wompi incluye un `checksum` calculado con propiedades de la transacción
     * concatenadas con el secreto de eventos.
     *
     * @param transactionId ID de la transacción
     * @param status Estado de la transacción
     * @param amountInCents Monto en centavos
     * @param receivedChecksum Checksum recibido en el header/body del webhook
     * @returns `true` si el checksum es válido
     */
    verifyWebhookSignature(
        transactionId: string,
        status: string,
        amountInCents: number,
        receivedChecksum: string,
    ): boolean {
        const chain = `${transactionId}${status}${amountInCents}${env.WOMPI_EVENTS_SECRET}`;
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
                Authorization: `Bearer ${env.WOMPI_PRIVATE_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error consultando transacción Wompi: ${response.status} ${response.statusText}`);
        }

        const body = await response.json() as { data: IWompiTransaction };
        return body.data;
    }
}

export default new WompiService();
