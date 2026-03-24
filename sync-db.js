import sequelize from './src/config/database.js';
import Warehouse from './src/models/warehouseModel.js';
import User from './src/models/userModel.js';

sequelize.authenticate().then(async () => {
  console.log('🔄 Sincronizando modelos...');
  await sequelize.sync({ alter: true, force: false }); // alter: true para agregar columnas sin eliminar datos
  console.log('✅ Sincronización completada');
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
