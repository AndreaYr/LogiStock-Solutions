import { Router, RequestHandler } from 'express';
import ChatbotController from '../controllers/chatbotController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * PUBLIC ROUTES (sin autenticación)
 */

/**
 * POST /api/chatbot/message/public
 * Enviar mensaje al chatbot sin necesidad de login
 * Body: { conversationId: string, content: string }
 */
router.post('/message/public', ChatbotController.sendMessagePublic as RequestHandler);

/**
 * PRIVATE ROUTES (requieren autenticación)
 */

// Todas las siguientes rutas requieren autenticación
router.use(authenticate);

/**
 * POST /api/chatbot/conversations
 * Crear nueva conversación de chatbot
 * Body: { title?: string }
 * Returns: { id, title, status, createdAt }
 */
router.post('/conversations', ChatbotController.createConversation as RequestHandler);

/**
 * POST /api/chatbot/message
 * Enviar mensaje al chatbot (requiere autenticación)
 * Body: { conversationId: string, content: string }
 * Returns: { id, conversationId, role, content, tokensUsed, cost, createdAt }
 */
router.post('/message', ChatbotController.sendMessage as RequestHandler);

/**
 * GET /api/chatbot/conversations
 * Listar conversaciones del usuario
 * Query: ?limit=10&offset=0
 * Returns: { conversations[], total, limit, offset, hasMore }
 */
router.get('/conversations', ChatbotController.listConversations as RequestHandler);

/**
 * GET /api/chatbot/conversations/:conversationId/messages
 * Obtener mensajes de una conversación
 * Query: ?limit=20&offset=0
 * Returns: { conversationId, messages[], total, hasMore }
 */
router.get(
  '/conversations/:conversationId/messages',
  ChatbotController.getMessages as RequestHandler
);

/**
 * DELETE /api/chatbot/conversations/:conversationId
 * Eliminar conversación (soft delete)
 * Returns: { message, conversationId }
 */
router.delete(
  '/conversations/:conversationId',
  ChatbotController.deleteConversation as RequestHandler
);

export default router;
