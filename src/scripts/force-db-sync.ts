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

        console.log('Añadiendo columnas faltantes a la tabla "warehouses"...');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "address" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "postal_code" VARCHAR(20);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_length" DECIMAL;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_width" DECIMAL;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_height" DECIMAL;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "image_url" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "monthly_price" DECIMAL(10, 2) NOT NULL DEFAULT 0;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "capacity_occupied" DECIMAL DEFAULT 0;');

        console.log('Añadiendo columnas faltantes a la tabla "rentals"...');
        await sequelize.query('ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "monthly_amount" DECIMAL(10, 2);');
        await sequelize.query('ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT \'ACTIVE\';');

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
