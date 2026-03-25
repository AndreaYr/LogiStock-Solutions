import { GoogleGenAI } from '@google/genai';
import { ChatbotMessage, ChatbotAuditLog, ChatbotConversation } from '../models/index.js';
import { env } from '../config/env.js';

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || ''),
};

/**
 * Obtiene los permisos disponibles según el rol del usuario
 */
function getRolePermissions(role?: string): string {
  const rolePermissions: { [key: string]: string } = {
    'admin': 'Todas las funciones: gestión de bodegas, usuarios, reportes, configuración',
    'gerente': 'Gestión de bodegas, reportes,movimientos, usuarios en su bodega',
    'operador': 'Registro de movimientos, visualización de inventario de sus bodegas',
    'usuario': 'Visualización de bodegas, solicitudes de alquiler, mis movimientos'
  };
  
  return rolePermissions[role?.toLowerCase() || 'usuario'] || rolePermissions['usuario'];
}

export class ChatbotService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY no configurada');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Procesa un mensaje y devuelve respuesta de Gemini
   */
  async processMessage(
    conversationId: string,
    userMessage: string,
    userId?: number,
    ipAddress?: string,
    userRole?: string,
    userName?: string
  ): Promise<{
    id: string;
    response: string;
    tokensUsed: number;
    cost: number;
  }> {
    try {
      logger.info('[ChatbotService] Procesando mensaje', { userId, conversationId, userRole });

      // 1. Validar mensaje
      if (!userMessage?.trim()) {
        throw new Error('Mensaje vacío');
      }

      // 2. Construir sistema prompt con contexto del rol
      let systemPrompt: string;
      
      if (userId) {
        // Chat privado - incluir información del rol
        systemPrompt = `Eres un asistente inteligente de LogiStock (plataforma de alquileres de bodegas).
Tu usuario es: ${userName || 'Usuario'} con rol: ${userRole || 'usuario'}.

Responde preguntas sobre:
- Alquiler de bodegas
- Movimientos de inventario
- Reportes y novedades
- Tu rol actual permite acceder a: ${getRolePermissions(userRole)}

Sé conciso, útil y amable. Responde en ESPAÑOL.
Nota: Si el usuario intenta acceder a información que su rol no permite, indícale amablemente que no tienes acceso a esa información por sus permisos.`;
      } else {
        // Chat público - sin acceso a información privada
        systemPrompt = `Eres un asistente inteligente de LogiStock (plataforma de alquileres de bodegas).
Información pública:
- Qué es LogiStock: plataforma que conecta dueños de inventario con propietarios de bodegas
- Servicios: alquiler de bodegas, registro de movimientos
Responde preguntas públicas en ESPAÑOL. Sé conciso y útil.
Nota: No tienes acceso a información privada de usuarios sin autenticar.`;
      }

      // 3. Llamar API de Gemini (nueva sintaxis)
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUsuario: ${userMessage}\n\nAsistente:`,
              },
            ],
          },
        ],
      });

      // 4. Extraer respuesta
      const aiResponseText = response.text || '';

      if (!aiResponseText) {
        throw new Error('Sin respuesta de la IA');
      }

      const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 5. Guardar en DB (async, no bloquea respuesta)
      this.saveMessages(
        conversationId,
        userMessage,
        aiResponseText,
        msgId,
        userId,
        ipAddress
      );

      logger.info('[ChatbotService] Respuesta enviada', { conversationId });

      return {
        id: msgId,
        response: aiResponseText,
        tokensUsed: Math.ceil(aiResponseText.length / 4),
        cost: 0, // Gemini free tier
      };
    } catch (error: any) {
      logger.error('[ChatbotService] Error', {
        error: error.message,
        conversationId,
      });
      throw error;
    }
  }

  /**
   * Guarda mensajes en DB (async, no bloquea respuesta HTTP)
   */
  private saveMessages(
    conversationId: string,
    userMsg: string,
    aiMsg: string,
    msgId: string,
    userId?: number,
    ipAddress?: string
  ) {
    // Guardar sin await para no bloquear respuesta
    (async () => {
      try {
        // Guardar mensaje del usuario
        await ChatbotMessage.create({
          conversationId,
          userId: userId || null,
          role: 'user',
          content: userMsg,
          tokensUsed: null,
          metadata: { timestamp: new Date() },
        });

        // Guardar respuesta del asistente
        await ChatbotMessage.create({
          id: msgId,
          conversationId,
          userId: userId || null,
          role: 'assistant',
          content: aiMsg,
          tokensUsed: Math.ceil(aiMsg.length / 4),
          metadata: { timestamp: new Date() },
        });

        // Registrar auditoría
        await ChatbotAuditLog.create({
          userId: userId || null,
          conversationId,
          requestText: userMsg,
          responseText: aiMsg,
          aiProvider: 'gemini',
          modelName: 'gemini-3-flash-preview',
          statusCode: 200,
        });

        logger.info('[ChatbotService] Mensajes guardados exitosamente');
      } catch (error: any) {
        logger.error('[ChatbotService] Error guardando mensajes:', error.message);
      }
    })();
  }

  /**
   * Crear conversación
   */
  async createConversation(userId: number, title?: string): Promise<string> {
    try {
      const conv = await ChatbotConversation.create({
        userId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        status: 'active',
        modelUsed: 'gemini-3-flash-preview',
      });
      return conv.id as string;
    } catch (error: any) {
      logger.error('[ChatbotService] Error creando conversación:', error);
      throw new Error('No se pudo crear conversación');
    }
  }

  /**
   * Obtener conversación
   */
  async getConversation(conversationId: string, userId?: number) {
    try {
      const where: any = { id: conversationId };
      if (userId) where.userId = userId;

      const conv = await ChatbotConversation.findOne({ where });
      return conv;
    } catch (error: any) {
      logger.error('[ChatbotService] Error obteniendo conversación:', error);
      return null;
    }
  }

  /**
   * Listar conversaciones del usuario
   */
  async listConversations(userId: number, limit: number = 10, offset: number = 0) {
    try {
      const { rows: conversations, count: total } =
        await ChatbotConversation.findAndCountAll({
          where: { userId },
          limit,
          offset,
          order: [['createdAt', 'DESC']],
        });

      return {
        conversations,
        total,
        hasMore: offset + limit < total,
      };
    } catch (error: any) {
      logger.error('[ChatbotService] Error listando conversaciones:', error);
      throw new Error('Error obteniendo conversaciones');
    }
  }

  /**
   * Eliminar conversación
   */
  async deleteConversation(conversationId: string, userId: number) {
    try {
      const deleted = await ChatbotConversation.update(
        { status: 'deleted' },
        { where: { id: conversationId, userId } }
      );

      return {
        deleted: deleted[0] > 0,
        conversationId,
      };
    } catch (error: any) {
      logger.error('[ChatbotService] Error eliminando conversación:', error);
      throw new Error('Error eliminando conversación');
    }
  }
}
