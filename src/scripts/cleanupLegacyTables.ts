import sequelize from '../config/database.js';

/**
 * Script temporal para eliminar las tablas antiguas en español.
 * Ejecutar con: npx tsx src/scripts/cleanupLegacyTables.ts
 */
const cleanup = async () => {
    try {
        console.log('⏳ Iniciando limpieza de tablas antiguas...');
        await sequelize.authenticate();

        const queryInterface = sequelize.getQueryInterface();

        // Tablas a eliminar (en orden de dependencia si aplica)
        const legacyTables = ['alquileres', 'bodegas'];

        for (const table of legacyTables) {
            try {
                // Verificamos si la tabla existe antes de intentar borrarla
                const tables = await queryInterface.showAllTables();
                if (tables.includes(table)) {
                    await queryInterface.dropTable(table);
                    console.log(`✅ Tabla '${table}' eliminada correctamente.`);
                } else {
                    console.log(`ℹ️ La tabla '${table}' no existe o ya fue eliminada.`);
                }
            } catch (err: any) {
                console.warn(`⚠️ No se pudo eliminar '${table}': ${err.message}`);
            }
        }

        console.log('🎉 Limpieza finalizada.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    }
};

cleanup();
