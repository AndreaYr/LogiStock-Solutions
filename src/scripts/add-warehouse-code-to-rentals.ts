/**
 * Script de migración — agrega la columna `warehouse_code` a la tabla rentals.
 *
 * Ejecutar una sola vez:
 *   npx tsx src/scripts/add-warehouse-code-to-rentals.ts
 */

import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // Verificar si la columna ya existe
        const [rows] = await sequelize.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'rentals' AND column_name = 'warehouse_code'
        `, { type: QueryTypes.SELECT }) as any[];

        if (rows) {
            console.log('ℹ️  La columna warehouse_code ya existe. Nada que hacer.');
            process.exit(0);
        }

        await sequelize.query(`
            ALTER TABLE rentals ADD COLUMN warehouse_code VARCHAR(6) NULL;
        `);

        console.log('✅ Columna warehouse_code agregada a la tabla rentals');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

run();
