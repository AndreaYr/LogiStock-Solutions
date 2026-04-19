import { config } from 'dotenv';
import sequelize from './src/config/database.js';

config();

async function updateSchema() {
  try {
    await sequelize.authenticate();
    await sequelize.query(`ALTER TYPE "enum_service_requests_status" ADD VALUE 'NEEDS_REVISION' AFTER 'COMPLETED'`);
    console.log('Added NEEDS_REVISION');
    process.exit(0);
  } catch (error: any) {
    if(error.message && error.message.includes('already exists')) {
        console.log('already exists');
        process.exit(0);
    }
    console.error('Error:', error.message);
    process.exit(1);
  }
}
updateSchema();