/**
 * Rutas de Wompi (pasarela de pago)
 *
 * POST /api/wompi/signature          → genera firma para el widget (requiere auth)
 * GET  /api/wompi/transactions/:id   → consulta transacción (requiere auth)
 * POST /api/webhooks/wompi           → webhook de Wompi (SIN auth, firma verificada internamente)
 */

import { Router } from 'express';
import { WompiController } from '../controllers/wompiController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas protegidas
router.post('/signature',           authenticate, WompiController.generateSignature);
router.get('/transactions/:id',     authenticate, WompiController.getTransaction);
router.post('/confirm-payment',     authenticate, WompiController.confirmPayment);
router.post('/simulate-payment',    authenticate, WompiController.simulatePayment); // solo dev

// Webhook de Wompi → público pero con verificación de firma interna
router.post('/webhook',             WompiController.handleWebhook);

export default router;
