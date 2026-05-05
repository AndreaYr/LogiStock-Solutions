import sequelize from '../config/database.js';
import { Warehouse } from '../models/index.js';

const nameMap: Record<string, string> = {
  // GENERAL
  'LogiStock Centro Armenia':           'Almacén Principal',
  'Bodega para cafe':                   'Depósito General',
  'LogiStock Centro Pereira':           'Nave de Distribución',
  'LogiStock Entrada Calarcá':          'Centro de Distribución',
  'LogiStock Agrícola Calarcá':         'Bodega de Carga',
  'LogiStock Distribuidores Calarcá':   'Plataforma de Despacho',
  'LogiStock Centro Manizales':         'Almacén Seco',
  'LogiStock Centro Bogotá':            'Bodega Multipropósito',
  'LogiStock Fontibón Aeropuerto Bogotá': 'Bodega Liviana',
  'LogiStock Suba Noroccidente Bogotá': 'Bodega de Consumo',

  // REFRIGERADA
  'LogiStock Frío Tropical Armenia':    'Bodega Refrigerada',
  'LogiStock Frío Pereira':             'Cuarto Frío Industrial',
  'LogiStock Gourmet Manizales':        'Frío Controlado',
  'LogiStock Frío Kennedy Bogotá':      'Túnel de Frío',

  // DELICADOS
  'LogiStock Artesanías y Delicados':   'Custodia Especializada',
  'LogiStock Textiles Bogotá':          'Depósito Sensible',
  'LogiStock Farmacéutico Bogotá':      'Almacén de Precisión',

  // EXTERIOR
  'LogiStock Maquinaria Pereira':       'Plataforma Abierta',

  // VIP
  'LogiStock Premium Pereira':          'Suite Exclusiva',
  'LogiStock Engativá Premium Bogotá':  'Depósito de Colección',
};

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.\n');

    let updated = 0;
    let notFound = 0;

    for (const [oldName, newName] of Object.entries(nameMap)) {
      const warehouse = await Warehouse.findOne({ where: { name: oldName } });
      if (warehouse) {
        await warehouse.update({ name: newName });
        console.log(`✅  "${oldName}" → "${newName}"`);
        updated++;
      } else {
        console.log(`⚠️  No encontrada: "${oldName}"`);
        notFound++;
      }
    }

    console.log(`\n✅ Actualizadas: ${updated} | No encontradas: ${notFound}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();
