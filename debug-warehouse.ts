import sequelize from './src/config/database.js';
import { WarehouseRepository } from './src/models/index.js';
import { Warehouse } from './src/models/index.js';

(async () => {
  try {
    await sequelize.authenticate();
    
    const warehouse = await Warehouse.findOne({
      where: { name: 'LogiStock Centro Armenia' }
    });

    if (!warehouse) {
      console.log('Bodega no encontrada');
      process.exit(1);
    }

    console.log('\n📊 Datos RAW de Sequelize:');
    console.log(`  name: ${warehouse.name}`);
    console.log(`  imageUrl type: ${typeof warehouse.imageUrl}`);
    console.log(`  imageUrl isArray:`, Array.isArray(warehouse.imageUrl));
    console.log(`  imageUrl value:`, warehouse.imageUrl);
    
    console.log('\n📊 Datos como toJSON:');
    const json = warehouse.toJSON();
    console.log(`  imageUrl type: ${typeof json.imageUrl}`);
    console.log(`  imageUrl isArray:`, Array.isArray(json.imageUrl));
    console.log(`  imageUrl value:`, json.imageUrl);

    console.log('\n📊 DataValues:');
    console.log(`  imageUrl type: ${typeof warehouse.dataValues.imageUrl}`);
    console.log(`  imageUrl value:`, warehouse.dataValues.imageUrl);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
