/**
 * Script para agregar las columnas otp_code y otp_expires a la tabla users.
 * Ejecutar una sola vez: npx tsx src/scripts/add-otp-columns.ts
 */

import sequelize from '../config/database.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        await sequelize.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS otp_code VARCHAR(255) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        `);

        console.log('✅ Columnas otp_code y otp_expires agregadas correctamente');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sequelize.close();
    }
}

run();
