/**
 * Script de migración — agrega la columna rental_duration a rental_applications.
 * Ejecutar una sola vez: npx tsx src/scripts/add-rental-duration-column.ts
 */

import sequelize from '../config/database.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        console.log('Agregando columna rental_duration a rental_applications...');
        await sequelize.query(`
            ALTER TABLE rental_applications
            ADD COLUMN IF NOT EXISTS rental_duration VARCHAR(10) NOT NULL DEFAULT 'MONTHLY'
                CHECK (rental_duration IN ('MONTHLY', 'SEMESTER', 'ANNUAL'));
        `);
        console.log('✅ Columna rental_duration agregada');

        console.log('\n✅ Migración completada exitosamente.');
    } catch (err) {
        console.error('❌ Error en la migración:', err);
    } finally {
        await sequelize.close();
    }
}

run();
