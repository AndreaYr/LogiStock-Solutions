import { ChatbotFeature, User, Rental, Warehouse } from '../models/index.js';

// Simple logger para debugging
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, err?: any) => console.error(`[ERROR] ${msg}`, err || ''),
};

export class ChatbotContextService {
  /**
   * Construye el system prompt de forma DINÁMICA
   * Lee funcionalidades desde BD, contexto del usuario
   * Permite que nuevas features se reflejen automáticamente sin cambios de código
   */
  async buildSystemPrompt(userId?: number): Promise<string> {
    try {
      // 1. Obtener funcionalidades desde BD
      const features = await this.getRegisteredFeatures(userId);

      // 2. Contexto del usuario (si autenticado)
      let userContext = '';
      if (userId) {
        try {
          userContext = await this.buildUserContext(userId);
        } catch (err) {
          logger.error('Could not build user context:', err);
          // Continuar sin contexto si falla
        }
      }

      // 3. Formatear funcionalidades
      const featuresText = features
        .map((f: any) => `${f.order}. ${f.name}: ${f.description}`)
        .join('\n');

      // 4. Prompt final
      const systemPrompt = `Eres un asistente inteligente de LogiStock, una plataforma de alojamiento de inventario en bodegas.

## Sobre LogiStock
- Conecta dueños de inventario con propietarios de bodegas
- Usuarios pueden alquilar bodegas, registrar movimientos (entrada/salida), reportar problemas
- Sistema tiene 5 roles: ADMIN, JEFE_BODEGA, AUXILIAR, OPERADOR, CLIENTE

${userContext ? `## Tu Contexto\n${userContext}` : ''}

## Funcionalidades disponibles
${featuresText}

## Instrucciones
- Responde siempre en ESPAÑOL
- Sé conciso, útil, empático
- Para preguntas sobre funcionalidad, guía paso a paso
${userId ? '- Accede a tus datos reales para responder sobre tus bodegas/alquileres' : '- NO accedas a datos personales sin autenticación'}
- NUNCA inventes datos; ofrece escalar a soporte si es necesario
- Si algo no está en las funcionalidades disponibles, sé honesto al respecto`;

      return systemPrompt;
    } catch (error) {
      logger.error('Error building system prompt:', error);
      // IMPORTANTE: No relanzar - retornar un prompt por defecto válido
      // Esto asegura que el chatbot siempre pueda responder incluso si la BD no está disponible
      const defaultFeatures = [
        { order: 1, name: 'Alquilar bodega', description: 'Buscar y solicitar alquiler de bodegas' },
        { order: 2, name: 'Registrar movimientos', description: 'Entrada y salida de inventario' },
        { order: 3, name: 'Reportar novedades', description: 'Reportar problemas o incidentes' }
      ];

      const featuresText = defaultFeatures
        .map((f: any) => `${f.order}. ${f.name}: ${f.description}`)
        .join('\n');

      return `Eres un asistente inteligente de LogiStock, una plataforma de alojamiento de inventario en bodegas.

## Sobre LogiStock
- Conecta dueños de inventario con propietarios de bodegas
- Usuarios pueden alquilar bodegas, registrar movimientos (entrada/salida), reportar problemas
- Sistema tiene 5 roles: ADMIN, JEFE_BODEGA, AUXILIAR, OPERADOR, CLIENTE

## Funcionalidades disponibles
${featuresText}

## Instrucciones
- Responde siempre en ESPAÑOL
- Sé conciso, útil, empático
- Para preguntas sobre funcionalidad, guía paso a paso
- NUNCA inventes datos; ofrece escalar a soporte si es necesario
- Si algo no está en las funcionalidades disponibles, sé honesto al respecto`;
    }
  }

  /**
   * Lee features desde BD
   * Cuando se agrega una feature nueva, automáticamente se refleja en el prompt
   */
  private async getRegisteredFeatures(userId?: number): Promise<any[]> {
    try {
      const query: any = { where: { enabled: true } };

      // Si es chatbot público, solo mostrar features que no requieran auth
      if (!userId) {
        (query.where as any).requiresAuth = false;
      }

      const features = await ChatbotFeature.findAll({
        ...query,
        order: [['order', 'ASC']]
      });

      return features;
    } catch (error) {
      logger.error('Error fetching features:', error);
      // Retornar features por defecto si hay error
      return [
        {
          order: 1,
          name: 'Alquilar bodega',
          description: 'Buscar bodegas disponibles, revisar precios y capacidad, enviar solicitud'
        },
        {
          order: 2,
          name: 'Registrar movimiento',
          description: 'Registrar entrada y salida de inventario'
        },
        {
          order: 3,
          name: 'Reportar novedad',
          description: 'Reportar daños, faltantes o problemas'
        }
      ];
    }
  }

  /**
   * Contexto personalizado del usuario autenticado
   */
  private async buildUserContext(userId: number): Promise<string> {
    try {
      const user = await User.findByPk(userId);
      let warehousesList = 'ninguna';
      let activeRentalsCount = 0;

      try {
        // @ts-ignore - Sequelize associations
        const warehouses = await Warehouse.findAll({ where: { userId } });
        if (warehouses && warehouses.length > 0) {
          warehousesList = warehouses.map((w: any) => w.name).join(', ');
        }

        // @ts-ignore
        const activeRentals = await Rental.findAll({
          where: { userId, status: 'active' }
        });
        activeRentalsCount = activeRentals?.length || 0;
      } catch (error) {
        logger.error('Could not fetch warehouses/rentals:', error);
      }

      return `
- Nombre: ${user?.firstName} ${user?.lastName}
- Email: ${user?.email}
- Bodegas interés: ${warehousesList}
- Alquileres activos: ${activeRentalsCount}`;
    } catch (error) {
      logger.error('Error building user context:', error);
      return '';
    }
  }
}

export default new ChatbotContextService();
