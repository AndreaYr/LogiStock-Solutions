import sequelize from '../config/database.js';

/**
 * Script de reversión para:
 * 1. Asegurar que las tablas antiguas de español estén eliminadas.
 * 2. Restaurar los nombres de los roles a ESPAÑOL (jefe de bodega, auxiliar, cliente).
 * 
 * Uso: npx tsx src/scripts/cleanupLegacyTables.ts
 */
const revertRoles = async () => {
    try {
        console.log('⏳ Iniciando restauración de roles a español...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida.');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Limpieza de tablas (por si acaso)
        const tablesToDrop = ['alquileres', 'bodegas'];
        for (const table of tablesToDrop) {
            try {
                const tables = await queryInterface.showAllTables();
                if (tables.includes(table)) {
                    await queryInterface.dropTable(table);
                    console.log(`✅ Tabla '${table}' eliminada.`);
                }
            } catch (e) { }
        }

        // 2. REVERTIR Roles a Español
        console.log('⏳ Restaurando nombres de roles a español...');
        const translations = [
            { old: 'warehouse_manager', new: 'jefe de bodega' },
            { old: 'assistant', new: 'auxiliar' },
            { old: 'client', new: 'cliente' }
        ];

        for (const t of translations) {
            await sequelize.query(
                `UPDATE roles SET name = :new WHERE name = :old`,
                { replacements: { old: t.old, new: t.new } }
            );
            console.log(`✅ Rol restaurado: ${t.old} -> ${t.new}`);
        }

        console.log('🎉 Restauración completada con éxito.');
        console.log('👉 Tip: Ahora ejecuta "npm run seed" en la EC2.');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error durante la restauración:', error.message);
        process.exit(1);
    }
};

revertRoles();
