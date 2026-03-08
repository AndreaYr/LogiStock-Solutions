/**
 * Interfaces TypeScript para la integración con la pasarela de pago Wompi.
 * Documentación: https://docs.wompi.co
 */

// ─── Solicitud de firma de integridad ────────────────────────────────────────

/** Datos que el frontend envía para generar la firma del widget */
export interface IWompiSignatureRequest {
    reference: string;      // Referencia única del pago (ej: "ORDER-001")
    amountInCents: number;  // Monto en centavos (ej: 50000 = $500 COP)
    currency: string;       // Moneda (ej: "COP")
}

/** Respuesta con la firma y la llave pública para montar el widget */
export interface IWompiSignatureResponse {
    signature: string;      // Hash SHA-256 generado en el servidor
    publicKey: string;      // Llave pública de Wompi (segura para exponer)
}

// ─── Webhook de Wompi ─────────────────────────────────────────────────────────

/** Estructura del evento que Wompi envía al webhook */
export interface IWompiWebhookEvent {
    event: string;                          // Tipo de evento (ej: "transaction.updated")
    data: {
        transaction: IWompiTransaction;
    };
    environment: 'prod' | 'test';
    signature: {
        checksum: string;                   // SHA-256 para verificar autenticidad
        properties: string[];               // Propiedades usadas en el checksum
    };
    timestamp: number;
    sent_at: string;
}

/** Representación de una transacción dentro del webhook */
export interface IWompiTransaction {
    id: string;
    created_at: string;
    finalized_at: string | null;
    amount_in_cents: number;
    reference: string;
    currency: string;
    payment_method_type: string;
    payment_method: Record<string, unknown>;
    redirect_url: string | null;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
    status_message: string | null;
    merchant: {
        name: string;
        legal_name: string;
        contact_name: string;
        phone_number: string;
        logo_url: string | null;
        legal_id_type: string;
        email: string;
        legal_id: string;
    };
    taxes: unknown[];
    tip_in_cents: number | null;
}

// ─── Modelo de BD para persistir transacciones ───────────────────────────────

/** Atributos de la tabla 'payment_transactions' */
export interface IPaymentTransactionAttributes {
    id: number;
    wompiId: string;            // ID único de la transacción en Wompi
    reference: string;          // Referencia de la orden
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
    amountInCents: number;
    currency: string;
    paymentMethodType: string;
    statusMessage: string | null;
    environment: 'prod' | 'test';
    finalizedAt: Date | null;
    rawPayload: object;         // Payload completo del webhook para auditoría
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPaymentTransactionCreationAttributes
    extends Omit<IPaymentTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
