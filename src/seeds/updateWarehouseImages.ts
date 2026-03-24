import sequelize from '../config/database.js';
import { Warehouse } from '../models/index.js';

const imageUrlsMaps: Record<string, string[]> = {
  'LogiStock Centro Armenia': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
  ],
  'LogiStock Frío Tropical Armenia': [
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
    'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=80',
    'https://images.unsplash.com/photo-1607287149476-8eee2c9491c0?w=800&q=80',
  ],
  'LogiStock Artesanías y Delicados': [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  ],
  'LogiStock Café Especial Armenia': [
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=800&q=80',
  ],
  'LogiStock Centro Pereira': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
  ],
  'LogiStock Frío Pereira': [
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
    'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=80',
  ],
  'LogiStock Maquinaria Pereira': [
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
    'https://images.unsplash.com/photo-1581092316562-40fed08221e1?w=800&q=80',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  ],
  'LogiStock Premium Pereira': [
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
  ],
  'LogiStock Entrada Calarcá': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
  ],
  'LogiStock Agrícola Calarcá': [
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    'https://images.unsplash.com/photo-1585329175054-7fdd55205fbb?w=800&q=80',
    'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
    'https://images.unsplash.com/photo-1581092316562-40fed08221e1?w=800&q=80',
  ],
  'LogiStock Distribuidores Calarcá': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
  ],
  'LogiStock Centro Manizales': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
  ],
  'LogiStock Gourmet Manizales': [
    'https://images.unsplash.com/photo-1554116469-81ae4a266b23?w=800&q=80',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=800&q=80',
  ],
  'LogiStock Parque Industrial Manizales': [
    'https://images.unsplash.com/photo-1512821528156-cc1d5bf3c76e?w=800&q=80',
    'https://images.unsplash.com/photo-1581092316562-40fed08221e1?w=800&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
  ],
  'LogiStock Centro Bogotá': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
  ],
  'LogiStock Frío Kennedy Bogotá': [
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    'https://images.unsplash.com/photo-1574037519326-4a1d1f88f756?w=800&q=80',
    'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=80',
    'https://images.unsplash.com/photo-1607287149476-8eee2c9491c0?w=800&q=80',
  ],
  'LogiStock Fontibón Aeropuerto Bogotá': [
    'https://images.unsplash.com/photo-1562183241-724a1638fb45?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
  ],
  'LogiStock Suba Noroccidente Bogotá': [
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
  ],
  'LogiStock Engativá Premium Bogotá': [
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab7?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    'https://images.unsplash.com/photo-1612244139837-9b847b30f639?w=800&q=80',
  ],
  'LogiStock Textiles Bogotá': [
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    'https://images.unsplash.com/photo-1587280413801-cd6ccb8b188f?w=800&q=80',
  ],
  'LogiStock Farmacéutico Bogotá': [
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=800&q=80',
  ],
};

const updateImages = async () => {
  try {
    console.log('⏳ Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.\n');

    console.log('🔄 Actualizando imageUrl (array) en bodegas...\n');
    let updated = 0;

    for (const [warehouseName, imageUrls] of Object.entries(imageUrlsMaps)) {
      const warehouse = await Warehouse.findOne({ where: { name: warehouseName } });
      
      if (warehouse) {
        await warehouse.update({ imageUrl: imageUrls });
        console.log(`✅ ${warehouseName} (${imageUrls.length} imágenes)`);
        updated++;
      } else {
        console.log(`⚠️  No encontrada: ${warehouseName}`);
      }
    }

    console.log(`\n✅ Actualización completada: ${updated} bodegas actualizadas`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateImages();
