import { config } from 'dotenv';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function updateSchema() {
  const client = new pg.Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected to database');

    // Make userId nullable in chatbot_messages
    await client.query(`
      ALTER TABLE chatbot_messages
      ALTER COLUMN "userId" DROP NOT NULL;
    `);
    console.log('✓ Made chatbot_messages.userId nullable');

    // Make userId nullable in chatbot_audit_logs
    await client.query(`
      ALTER TABLE chatbot_audit_logs
      ALTER COLUMN "userId" DROP NOT NULL;
    `);
    console.log('✓ Made chatbot_audit_logs.userId nullable');

    console.log('✓ All changes applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateSchema();
