import sequelize from '../config/database.js';
import { Warehouse } from '../models/index.js';

const run = async () => {
  await sequelize.authenticate();
  const all = await Warehouse.findAll({ attributes: ['id', 'name', 'warehouseType'], order: [['id', 'ASC']] });
  all.forEach((w: any) => console.log(`${w.id} | ${w.warehouseType} | ${w.name}`));
  process.exit(0);
};

run();
