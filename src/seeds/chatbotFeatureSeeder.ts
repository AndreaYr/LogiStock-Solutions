/**
 * Seeder para inicializar funcionalidades del chatbot
 * Ejecutar: npm run seed
 * O específico: tsx src/seeds/chatbotFeatureSeeder.ts
 */

import ChatbotFeature from '../models/chatbotFeatureModel.js';

const DEFAULT_FEATURES = [
  {
    name: 'Alquilar bodega',
    description: 'Buscar bodegas disponibles, revisar precios y capacidad, enviar solicitud de alquiler',
    category: 'rentals',
    order: 1,
    requiresAuth: false,
    enabled: true
  },
  {
    name: 'Registrar movimiento',
    description: 'Registrar entrada y salida de inventario en tus bodegas alquiladas',
    category: 'inventory',
    order: 2,
    requiresAuth: true,
    enabled: true
  },
  {
    name: 'Reportar novedad',
    description: 'Reportar daños, faltantes o problemas en tu bodega',
    category: 'support',
    order: 3,
    requiresAuth: true,
    enabled: true
  },
  {
    name: 'Consultar pagos',
    description: 'Ver estado de cuotas pendientes y métodos de pago disponibles',
    category: 'payments',
    order: 4,
    requiresAuth: true,
    enabled: true
  },
  {
    name: 'Gestionar usuarios',
    description: 'ADMIN: crear usuarios, asignar roles, cambiar permisos',
    category: 'admin',
    order: 5,
    requiresAuth: true,
    minRole: 'ADMIN',
    enabled: true
  }
];

async function seedChatbotFeatures() {
  try {
    console.log('[Chatbot] Iniciando seeder de features...');

    // Verificar si ya existen features
    const existingCount = await ChatbotFeature.count();
    if (existingCount > 0) {
      console.log(`[Chatbot] ✅ Ya existen ${existingCount} features registradas`);
      return;
    }

    // Insertar features por defecto
    const created = await ChatbotFeature.bulkCreate(DEFAULT_FEATURES);
    console.log(`[Chatbot] ✅ ${created.length} features creadas exitosamente`);

    // Mostrar resumen
    console.log('[Chatbot] Features iniciales:');
    created.forEach(f => {
      console.log(`  - ${f.name} (${f.category})`);
    });

  } catch (error) {
    console.error('[Chatbot] ❌ Error en seeder:', error);
    throw error;
  }
}

export default seedChatbotFeatures;
