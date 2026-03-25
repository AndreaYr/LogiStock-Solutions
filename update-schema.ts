import { config } from 'dotenv';
import sequelize from './dist/config/database.js';

config();

async function updateSchema() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Execute raw SQL to make userId nullable
    await sequelize.query(`
      ALTER TABLE chatbot_messages
      ALTER COLUMN "userId" DROP NOT NULL;
    `);
    console.log('✓ Made chatbot_messages.userId nullable');

    await sequelize.query(`
      ALTER TABLE chatbot_audit_logs
      ALTER COLUMN "userId" DROP NOT NULL;
    `);
    console.log('✓ Made chatbot_audit_logs.userId nullable');

    console.log('✓ All changes applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateSchema();
