import { GoogleGenAI } from '@google/genai';
import { ChatbotMessage, ChatbotAuditLog, ChatbotConversation } from '../models/index.js';
import { env } from '../config/env.js';

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || ''),
};

/**
 * Obtiene los permisos y paneles disponibles según el rol del usuario
 */
function getRolePermissions(role?: string): string {
  const roleDetails: { [key: string]: string } = {
    'admin': `PANELES: Dashboard (Estadísticas globales), Gestión de Usuarios, Gestión de Bodegas, Configuración del Sistema, Auditoría.
FUNCIONES: Crear/editar/eliminar usuarios, modificar roles, gestionar bodegas, ver todos los reportes, configurar parámetros del sistema, ver historial de auditoría.`,
    
    'gerente': `PANELES: Dashboard (su bodega), Solicitudes de Alquiler, Órdenes de Servicio, Revisar Reportes, Movimientos, Inventario, Novedades, Usuarios de Sede, Reportes.
FUNCIONES: Aprobar/rechazar solicitudes de alquiler, asignar órdenes a auxiliares, revisar y aprobar reportes de auxiliares (o rechazar para corrección), ver movimientos de entrada/salida, consultar inventario actual, gestionar usuarios de su bodega, crear reportes, atender novedades de clientes.`,
    
    'jefe_bodega': `PANELES: Dashboard (su bodega), Solicitudes de Alquiler, Órdenes de Servicio, Revisar Reportes, Movimientos, Inventario, Novedades, Usuarios de Sede, Reportes.
FUNCIONES: Idénticas al Gerente. Aprobar/rechazar alquileres, asignar órdenes de servicio, revisar reportes completados, rechazar para que auxiliar corrija, ver inventario, gestionar usuarios, crear reportes.`,
    
    'auxiliar': `PANELES: Dashboard (mis tareas), Mis Órdenes de Servicio, Reportar Movimiento.
FUNCIONES: Ver órdenes asignadas (estado: PENDING o NEEDS_REVISION), completar órdenes reportando productos recibidos/devueltos/no recibidos, añadir observaciones, enviar reporte para que jefe revise. Cuando jefe rechaza (NEEDS_REVISION), vuelve a aparecer en "Mis Órdenes" para corregir.`,
    
    'operador': `PANELES: Dashboard, Registro de Movimientos.
FUNCIONES: Registrar entrada/salida de carga, realizar estiba, consultar inventario asignado.`,
    
    'client': `PANELES: Dashboard (mis datos), Mis Bodegas (alquileres activos), Solicitar Alquiler, Mis Movimientos, Mi Inventario.
FUNCIONES: Ver bodegas disponibles, solicitar alquiler de espacio, consultar movimientos de entrada/salida, ver inventario actual, gestionar su perfil.`
  };
  
  return roleDetails[role?.toLowerCase() || 'client'] || roleDetails['client'];
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
        // Chat privado - incluir información del rol y paneles específicos
        systemPrompt = `Eres el "Asistente LogiStock" (plataforma de alquileres de bodegas y gestión de inventario).

═══ CONTEXTO DEL NEGOCIO ═══
LogiStock conecta PROPIETARIOS DE BODEGAS con DUEÑOS DE INVENTARIO (clientes).
- CLIENTES: Alquilan espacios de bodega para guardar su mercancía
- PROPIETARIOS: Monetizan sus espacios disponibles en bodegas
- Funciones: Gestión de alquileres, movimientos de carga (entrada/salida), reportes, órdenes de servicio

PROCESOS CLAVE:
1. SOLICITUDES DE ALQUILER: Los clientes solicitan alquilar espacio → Gerentes/Jefes aprueban
2. MOVIMIENTOS: Entrada (INBOUND) y Salida (OUTBOUND) de productos
3. ÓRDENES DE SERVICIO: Tareas asignadas a auxiliares (recepción, despacho, etc.)
4. REPORTES: Auxiliares reportan movimientos → Jefe revisa y aprueba para notificar al cliente
5. INVENTARIO: Control de qué productos hay, dónde y en qué cantidad

ROLES Y RESPONSABILIDADES:
- ADMIN: Control total del sistema
- GERENTE/JEFE DE BODEGA: Aprueba solicitudes, revisa reportes, gestiona inventario, asigna órdenes a auxiliares
- AUXILIAR: Ejecuta órdenes, reporta movimientos completados
- OPERADOR: Registra movimientos de carga
- CLIENTE: Solicita alquiler, consulta su inventario y movimientos

PANELES Y FUNCIONES DEL USUARIO:
${userRole?.toLowerCase() === 'jefe_bodega' || userRole?.toLowerCase() === 'gerente' ? `
TU PANEL (${userRole}):
📊 DASHBOARD: Vista general de tu bodega
📋 SOLICITUDES DE ALQUILER: Aprobar/rechazar nuevas solicitudes de clientes
📦 ÓRDENES DE SERVICIO: Ver órdenes asignadas a auxiliares, crear nuevas órdenes
👁 REVISAR REPORTES: Ver reportes completados por auxiliares, aprobar o rechazar (enviar a corrección)
📈 MOVIMIENTOS: Historial de entrada/salida de mercancía
📊 INVENTARIO: Ver qué productos hay, cantidades, ubicación en la bodega
⚠ NOVEDADES: Atender problemas reportados por clientes
👥 USUARIOS DE SEDE: Gestionar auxiliares y operadores
📄 REPORTES: Generar reportes de movimientos, ingresos, etc.
` : userRole?.toLowerCase() === 'auxiliar' ? `
TU PANEL (AUXILIAR):
📊 DASHBOARD: Mis tareas pendientes
✅ MIS ÓRDENES DE SERVICIO: Ver órdenes asignadas
  - Si estado = PENDING: Completa la orden reportando qué productos recibiste/devolviste/no recibiste
  - Si estado = NEEDS_REVISION: El jefe rechazó tu reporte, aparece aquí para que corrijas
💬 REPORTAR MOVIMIENTO: Envía el reporte completado con detalles
` : userRole?.toLowerCase() === 'client' ? `
TU PANEL (CLIENTE):
📊 DASHBOARD: Tus datos y resumen
🏢 MIS BODEGAS: Ver bodegas donde alquilas espacio
🆕 SOLICITAR ALQUILER: Solicitar más espacio en una bodega
📦 MIS MOVIMIENTOS: Ver entrada/salida de tu mercancía
📊 MI INVENTARIO: Consultar qué productos tienes guardados
` : `
TU PANEL (${userRole}):
Acceso según tu rol configurado.
` }

Usuario actual: ${userName || 'Usuario'} con rol: ${userRole || 'usuario'}

PANELES DISPONIBLES PARA TU ROL:
${getRolePermissions(userRole)}

IMPORTANTE SOBRE TU RESPUESTA:
1. **POR DEFECTO: Respuestas cortas y concisas** - Tu respuesta inicial debe ser breve, útil y directa.
2. **Si el usuario pregunta "cómo hago X"**: Menciona el PANEL donde lo hace y luego PREGUNTA: "¿Quieres que te dé el paso a paso detallado?"
3. **Si el usuario confirma paso a paso**: Proporciona instrucciones MUY ESPECÍFICAS con: Panel → Botones → Campos → Acciones (ej: "Ve a la pestaña 'Revisar Reportes' → Click en el botón 'Revisar' → Escribe tus notas en el campo 'Notas de Revisión' → Click en 'Aprobar'").
4. Si intenta acceder a paneles/funciones fuera de su rol, explícale amablemente qué SÍ puede hacer.
5. Responde en ESPAÑOL, tono útil, cordial y profesional.`;
      } else {
        // Chat público - sin acceso a información privada
        systemPrompt = `Eres el "Asistente LogiStock" (plataforma de alquileres de bodegas).

═══ ¿QUÉ ES LOGISTOCK? ═══
Plataforma que conecta PROPIETARIOS DE BODEGAS con CLIENTES que necesitan guardar mercancía.

PARA CLIENTES (dueños de inventario):
- Alquila espacio seguro en bodegas verificadas
- Registra movimientos (entrada/salida) de tu mercancía
- Obtén reportes de lo que entra y sale
- Accede a tu inventario 24/7

PARA PROPIETARIOS DE BODEGAS:
- Alquila tus espacios disponibles
- Gestiona múltiples bodegas
- Asigna personal para recepción y despacho
- Genera reportes y controla ingresos

PROCESOS PRINCIPALES:
1. Solicitar alquiler de espacio
2. Registrar movimientos (entrada/salida de productos)
3. Obtener reportes de inventario
4. Notificaciones automáticas

IMPORTANTE SOBRE TU RESPUESTA:
1. **Respuestas cortas y claras** - Sé directo y útil.
2. Si pregunta contiene "paso a paso", "instrucciones", "cómo", etc., PREGUNTA: "¿Quieres instrucciones más detalladas?"
3. Responde en ESPAÑOL, tono cordial y profesional.
4. No compartir información privada de otros usuarios.`;
      }

      // 2.5 Obtener historial previo de la conversación
      const pastMessages = await ChatbotMessage.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
        limit: 10 // últimos 10 mensajes para contexto
      });

      const historyContents = pastMessages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user', // Gemini requires 'model' or 'user'
        parts: [{ text: msg.content }]
      }));

      // 3. Llamar API de Gemini (nueva sintaxis)
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...historyContents,
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nNueva pregunta: ${userMessage}` }],
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
