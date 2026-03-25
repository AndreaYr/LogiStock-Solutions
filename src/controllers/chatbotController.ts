import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbotService.js';

// Extender Request para incluir user (compatibilidad con middleware)
interface AuthRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role: any; // Usar any para evitar conflictos de tipo con UserRole
  };
}

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || '')
};

// Instancia única del servicio (lazy initialization)
let chatbotService: ChatbotService | null = null;

function getChatbotService(): ChatbotService {
  if (!chatbotService) {
    chatbotService = new ChatbotService();
  }
  return chatbotService;
}

export class ChatbotController {
  /**
   * POST /api/chatbot/conversations
   * Crear nueva conversación (requiere autenticación)
   */
  static async createConversation(req: AuthRequest, res: Response) {
    try {
      const service = getChatbotService();
      const userId = req.user?.userId;  // Cambiar de "id" a "userId"
      if (!userId) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      const { title } = req.body;
      const conversationId = await service.createConversation(userId, title);

      res.status(201).json({
        id: conversationId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        status: 'active',
        createdAt: new Date()
      });
    } catch (error: any) {
      logger.error('Error creating conversation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/chatbot/message/public
   * Enviar mensaje sin autenticación (chatbot público)
   */
  static async sendMessagePublic(req: Request, res: Response) {
    try {
      const { conversationId, content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Mensaje vacío' });
      }

      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId requerido' });
      }

      // Obtener IP del cliente
      const ipAddress = ChatbotController.getClientIP(req);

      // Procesar sin userId (público)
      const result = await getChatbotService().processMessage(
        conversationId,
        content.trim(),
        undefined, // Sin userId = público
        ipAddress
      );

      res.status(200).json({
        id: result.id,
        conversationId,
        role: 'assistant',
        content: result.response,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        isPublic: true,
        createdAt: new Date()
      });
    } catch (error: any) {
      if (error.message.includes('Rate limit') || error.message.includes('Límite')) {
        return res.status(429).json({
          error: error.message,
          retryAfter: 3600
        });
      }

      logger.error('Error in public message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/chatbot/message
   * Enviar mensaje con autenticación (chatbot privado)
   */
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      const { conversationId, content, userRole, userName } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Mensaje vacío' });
      }

      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId requerido' });
      }

      const ipAddress = ChatbotController.getClientIP(req);

      // Procesar con userId (privado) + información del rol
      const result = await getChatbotService().processMessage(
        conversationId,
        content.trim(),
        userId,
        ipAddress,
        userRole,  // Pasar rol del usuario
        userName   // Pasar nombre del usuario
      );

      res.status(200).json({
        id: result.id,
        conversationId,
        userId,
        role: 'assistant',
        content: result.response,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        createdAt: new Date()
      });
    } catch (error: any) {
      if (error.message.includes('Rate limit') || error.message.includes('Límite')) {
        return res.status(429).json({
          error: error.message,
          retryAfter: 3600
        });
      }

      logger.error('Error in private message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/chatbot/conversations/:conversationId/messages
   * Obtener mensaje de conversación
   */
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.userId;
      const { limit = 20, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      const conversation = await getChatbotService().getConversation(
        conversationId as string,
        userId
      );

      if (!conversation) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }

      // @ts-ignore
      const messages = conversation.messages || [];
      const paginatedMessages = messages.slice(
        Number(offset),
        Number(offset) + Number(limit)
      );

      res.status(200).json({
        conversationId,
        messages: paginatedMessages,
        total: messages.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < messages.length
      });
    } catch (error: any) {
      logger.error('Error fetching messages:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/chatbot/conversations
   * Listar conversaciones del usuario
   */
  static async listConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      const { limit = 10, offset = 0 } = req.query;

      const { conversations, total } = await getChatbotService().listConversations(
        userId,
        Number(limit),
        Number(offset)
      );

      res.status(200).json({
        conversations,
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
      });
    } catch (error: any) {
      logger.error('Error listing conversations:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/chatbot/conversations/:conversationId
   * Eliminar conversación (soft delete)
   */
  static async deleteConversation(req: AuthRequest, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      const deleted = await getChatbotService().deleteConversation(
        conversationId as string,
        userId
      );

      if (!deleted) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }

      res.status(200).json({
        message: 'Conversación eliminada',
        conversationId
      });
    } catch (error: any) {
      logger.error('Error deleting conversation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Helper: Extraer IP del cliente desde Request
   */
  private static getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
  }
}

export default ChatbotController;
