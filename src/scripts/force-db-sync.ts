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
        await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires" TIMESTAMP WITH TIME ZONE;');

        console.log('Añadiendo columnas faltantes a la tabla "warehouses"...');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "address" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "postal_code" VARCHAR(20);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_length" DECIMAL(10,2);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_width" DECIMAL(10,2);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_height" DECIMAL(10,2);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "image_url" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "monthly_price" DECIMAL(10, 2) NOT NULL DEFAULT 0;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "capacity_occupied" DECIMAL(5,2) DEFAULT 0;');
        // Nuevas columnas para mayor detalle de la bodega
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100) NOT NULL DEFAULT \'Sin nombre\';');
        await sequelize.query('ALTER TABLE "warehouses" ALTER COLUMN "description" TYPE TEXT;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "warehouse_type" VARCHAR(20) NOT NULL DEFAULT \'GENERAL\';');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "usable_area" DECIMAL(10,2);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "utilities_included" BOOLEAN NOT NULL DEFAULT FALSE;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "utilities_responsible" VARCHAR(20);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "utilities_details" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "has_security_system" BOOLEAN NOT NULL DEFAULT FALSE;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "has_loading_dock" BOOLEAN NOT NULL DEFAULT FALSE;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "has_parking" BOOLEAN NOT NULL DEFAULT FALSE;');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "access_hours" VARCHAR(100);');
        await sequelize.query('ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "is_available" BOOLEAN NOT NULL DEFAULT TRUE;');

        console.log('Añadiendo columnas faltantes a la tabla "rentals"...');
        await sequelize.query('ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "monthly_amount" DECIMAL(10, 2);');
        await sequelize.query('ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT \'ACTIVE\';');

        console.log('Añadiendo columnas faltantes a la tabla "movements"...');
        await sequelize.query('ALTER TABLE "movements" ADD COLUMN IF NOT EXISTS "service_request_id" INTEGER;');
        await sequelize.query('ALTER TABLE "movements" ADD COLUMN IF NOT EXISTS "photos" JSON DEFAULT \'[]\';');
        await sequelize.query('ALTER TABLE "movements" ADD COLUMN IF NOT EXISTS "observations" TEXT;');
        await sequelize.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'movements_service_request_fk'
                ) THEN
                    ALTER TABLE "movements" ADD CONSTRAINT "movements_service_request_fk" 
                    FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") 
                    ON DELETE SET NULL ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        console.log('Añadiendo columnas faltantes a la tabla "service_requests"...');
        await sequelize.query('ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "scheduled_date" VARCHAR(10);');
        await sequelize.query('ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "scheduled_time" VARCHAR(5);');
        await sequelize.query('ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;');
        await sequelize.query('ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "assigned_auxiliary_id" INTEGER;');

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
