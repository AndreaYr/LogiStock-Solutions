/**
 * Migración — agrega columna document_photo_back_path a rental_contracts.
 * Ejecutar una sola vez: npx tsx src/scripts/add-document-photo-back.ts
 */

import sequelize from '../config/database.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        await sequelize.query(`
            ALTER TABLE rental_contracts
            ADD COLUMN IF NOT EXISTS document_photo_back_path VARCHAR(500) DEFAULT NULL;
        `);
        console.log('✅ Columna document_photo_back_path agregada a rental_contracts');

    } catch (err) {
        console.error('❌ Error en la migración:', err);
    } finally {
        await sequelize.close();
    }
}

run();
