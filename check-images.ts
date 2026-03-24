import sequelize from './src/config/database.js';
import { Warehouse } from './src/models/index.js';

(async () => {
  try {
    await sequelize.authenticate();
    
    const warehouses = await Warehouse.findAll({
      attributes: ['id', 'name', 'imageUrl'],
      limit: 3,
    });

    console.log('\n📊 Datos en la BD:\n');
    warehouses.forEach(w => {
      console.log(`${w.name}:`);
      console.log(`  Type: ${typeof w.imageUrl}`);
      console.log(`  Value:`, w.imageUrl);
      console.log(`  Is Array: ${Array.isArray(w.imageUrl)}`);
      if (Array.isArray(w.imageUrl)) {
        console.log(`  Length: ${w.imageUrl.length}`);
      }
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
