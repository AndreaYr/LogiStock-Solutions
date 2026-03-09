import sequelize from '../config/database.js';
import '../models/index.js'; // Importamos modelos para que Sequelize los conozca

async function forceSync() {
    try {
        console.log('--- REPARANDO ESQUEMA DE BASE DE DATOS (RAW SQL) ---');
        console.log('Conectando a:', process.env.DB_HOST);

        await sequelize.authenticate();
        console.log('✅ Conexión exitosa.');

        console.log('Añadiendo columnas faltantes a la tabla "users"...');

        // Ejecutamos comandos SQL directos para evitar errores de Sequelize sync{alter:true} con Enums
        await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP WITH TIME ZONE;');
        await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN DEFAULT FALSE;');
        await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP WITH TIME ZONE;');

        console.log('✅ Columnas añadidas (si no existían).');

        // Intentamos un sync normal (sin alter:true) solo para asegurar que otras tablas básicas existan
        console.log('Sincronizando modelos básicos...');
        await sequelize.sync();

        console.log('✅ ¡Reparación completada con éxito!');
        console.log('Intenta iniciar sesión ahora.');

    } catch (error) {
        console.error('❌ ERROR durante la reparación:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

forceSync();
