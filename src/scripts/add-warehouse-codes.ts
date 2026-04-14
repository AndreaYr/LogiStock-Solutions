/**
 * Script de migración — agrega la columna `code` a la tabla warehouses
 * y asigna un código único de 6 dígitos a cada bodega existente.
 *
 * Ejecutar una sola vez:
 *   npx tsx src/scripts/add-warehouse-codes.ts
 */

import sequelize from '../config/database.js';

function generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // 1. Agregar columna (si no existe)
        console.log('Agregando columna code...');
        await sequelize.query(`
            ALTER TABLE warehouses
            ADD COLUMN IF NOT EXISTS code VARCHAR(6) UNIQUE;
        `);
        console.log('✅ Columna code agregada');

        // 2. Asignar código a bodegas que no tienen
        const [rows] = await sequelize.query(
            `SELECT id FROM warehouses WHERE code IS NULL`
        ) as [{ id: number }[], unknown];

        console.log(`📦 ${rows.length} bodega(s) sin código. Asignando...`);

        for (const row of rows) {
            let code: string;
            let attempts = 0;
            // Reintentar hasta encontrar un código libre
            while (true) {
                code = generateCode();
                const [existing] = await sequelize.query(
                    `SELECT id FROM warehouses WHERE code = :code`,
                    { replacements: { code } }
                ) as [{ id: number }[], unknown];
                if (existing.length === 0) break;
                if (++attempts > 100) throw new Error('No se pudo generar un código único después de 100 intentos.');
            }
            await sequelize.query(
                `UPDATE warehouses SET code = :code WHERE id = :id`,
                { replacements: { code: code!, id: row.id } }
            );
            console.log(`  Bodega ${row.id} → código ${code!}`);
        }

        // 3. Hacer la columna NOT NULL ahora que todos tienen código
        await sequelize.query(`
            ALTER TABLE warehouses
            ALTER COLUMN code SET NOT NULL;
        `);
        console.log('✅ Columna code marcada como NOT NULL');

        console.log('\n✅ Migración completada exitosamente.');
    } catch (err) {
        console.error('❌ Error en la migración:', err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
