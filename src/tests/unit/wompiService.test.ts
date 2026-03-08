/**
 * Tests unitarios para WompiService
 * No requieren conexión a internet ni BD.
 * Verifica la lógica criptográfica de firmas.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createHash } from 'crypto';

beforeAll(() => {
    process.env.WOMPI_PUBLIC_KEY       = 'pub_test_KNdmFPNZq1JjKmVmpJkABrX1mYujfHG1';
    process.env.WOMPI_PRIVATE_KEY      = 'prv_test_nxW2ZTxSxST2Ml1tlt20BXPlC2VbyAwO';
    process.env.WOMPI_INTEGRITY_SECRET = 'test_integrity_7rpwUDeBhSd4ecYePRnNHXUY0YtLgEDa';
    process.env.WOMPI_EVENTS_SECRET    = 'test_events_egodi8LzBEm4OorHa8d2YUegz6raZBYd';
    process.env.NODE_ENV               = 'test';
});

const getWompiService = async () => (await import('../../services/wompiService.js')).default;

describe('WompiService - generateSignature', () => {

    it('retorna signature y publicKey', async () => {
        const wompi = await getWompiService();
        const result = wompi.generateSignature({
            reference: 'ORDER-001',
            amountInCents: 50000,
            currency: 'COP',
        });

        expect(result).toHaveProperty('signature');
        expect(result).toHaveProperty('publicKey');
        expect(result.publicKey).toBe('pub_test_KNdmFPNZq1JjKmVmpJkABrX1mYujfHG1');
    });

    it('genera el hash SHA-256 correcto según la cadena de Wompi', async () => {
        const wompi = await getWompiService();
        const reference     = 'ORDER-TEST-42';
        const amountInCents = 120000;
        const currency      = 'COP';
        const secret        = 'test_integrity_7rpwUDeBhSd4ecYePRnNHXUY0YtLgEDa';

        // Calcular manualmente el hash esperado
        const expectedHash = createHash('sha256')
            .update(`${reference}${amountInCents}${currency}${secret}`)
            .digest('hex');

        const result = wompi.generateSignature({ reference, amountInCents, currency });
        expect(result.signature).toBe(expectedHash);
    });

    it('genera firmas distintas para referencias distintas', async () => {
        const wompi = await getWompiService();
        const base = { amountInCents: 50000, currency: 'COP' };

        const r1 = wompi.generateSignature({ ...base, reference: 'ORDER-001' });
        const r2 = wompi.generateSignature({ ...base, reference: 'ORDER-002' });

        expect(r1.signature).not.toBe(r2.signature);
    });
});

describe('WompiService - verifyWebhookSignature', () => {

    it('valida un checksum correcto', async () => {
        const wompi = await getWompiService();
        const txId   = 'tx-abc-123';
        const status = 'APPROVED';
        const amount = 50000;
        const secret = 'test_events_egodi8LzBEm4OorHa8d2YUegz6raZBYd';

        const checksum = createHash('sha256')
            .update(`${txId}${status}${amount}${secret}`)
            .digest('hex');

        expect(wompi.verifyWebhookSignature(txId, status, amount, checksum)).toBe(true);
    });

    it('rechaza un checksum alterado', async () => {
        const wompi = await getWompiService();
        expect(
            wompi.verifyWebhookSignature('tx-abc-123', 'APPROVED', 50000, 'checksum-falso')
        ).toBe(false);
    });

    it('rechaza si el monto fue modificado', async () => {
        const wompi = await getWompiService();
        const secret = 'test_events_egodi8LzBEm4OorHa8d2YUegz6raZBYd';

        // Firma con monto original
        const checksum = createHash('sha256')
            .update(`tx-abc-123APPROVED50000${secret}`)
            .digest('hex');

        // Verifica con monto diferente → debe fallar
        expect(wompi.verifyWebhookSignature('tx-abc-123', 'APPROVED', 99999, checksum)).toBe(false);
    });
});
