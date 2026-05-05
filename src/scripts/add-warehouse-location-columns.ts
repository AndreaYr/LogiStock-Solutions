/**
 * Agrega las columnas nivel, pasillo y numero_bodega a la tabla warehouses.
 * Ejecutar una sola vez: npx tsx src/scripts/add-warehouse-location-columns.ts
 */

import sequelize from '../config/database.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        await sequelize.query(`
            ALTER TABLE warehouses
            ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS pasillo INTEGER DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS numero_bodega INTEGER DEFAULT NULL;
        `);

        console.log('✅ Columnas nivel, pasillo y numero_bodega agregadas correctamente');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sequelize.close();
    }
}

run();
