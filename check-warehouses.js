import sequelize from './src/config/database.js';

sequelize.authenticate().then(async () => {
  const result = await sequelize.query(`
    SELECT COUNT(*) as total, COUNT("image_urls") as with_urls
    FROM warehouses
  `, { type: 'SELECT' });
  console.log('Warehouses status:', result[0]);
  if (result[0] && result[0][0]) {
    console.log(`Total: ${result[0][0].total} warehouses`);
    console.log(`With image_urls: ${result[0][0].with_urls}`);
  }
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
