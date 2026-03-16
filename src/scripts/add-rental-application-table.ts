/**
 * Script de migración — crea la tabla rental_applications y actualiza ENUMs.
 * Ejecutar una sola vez: npx tsx src/scripts/add-rental-application-table.ts
 */

import sequelize from '../config/database.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // ── 1. Actualizar ENUM de notificaciones ──────────────────────────────
        console.log('Actualizando ENUM de notificaciones...');
        await sequelize.query(`
            ALTER TYPE "enum_notifications_type"
            ADD VALUE IF NOT EXISTS 'application_submitted';
        `);
        await sequelize.query(`
            ALTER TYPE "enum_notifications_type"
            ADD VALUE IF NOT EXISTS 'application_approved';
        `);
        await sequelize.query(`
            ALTER TYPE "enum_notifications_type"
            ADD VALUE IF NOT EXISTS 'application_rejected';
        `);
        await sequelize.query(`
            ALTER TYPE "enum_notifications_type"
            ADD VALUE IF NOT EXISTS 'application_flagged';
        `);
        console.log('✅ ENUM de notificaciones actualizado');

        // ── 2. Crear tabla rental_applications ────────────────────────────────
        console.log('Creando tabla rental_applications...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS rental_applications (
                id                    SERIAL PRIMARY KEY,
                user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                warehouse_id          INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE,
                document_type         VARCHAR(10) NOT NULL CHECK (document_type IN ('CC', 'CE', 'PASAPORTE')),
                document_number       VARCHAR(20) NOT NULL,
                phone                 VARCHAR(10) NOT NULL,
                address               VARCHAR(255) NOT NULL,
                business_activity     VARCHAR(255) NOT NULL,
                merchandise_type      VARCHAR(255) NOT NULL,
                commercial_ref_name   VARCHAR(150) NOT NULL,
                commercial_ref_phone  VARCHAR(10) NOT NULL,
                has_dangerous_goods   BOOLEAN NOT NULL DEFAULT FALSE,
                requires_refrigeration BOOLEAN NOT NULL DEFAULT FALSE,
                accepts_terms         BOOLEAN NOT NULL,
                status                VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                        CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
                rejection_reason      TEXT DEFAULT NULL,
                ofac_status           VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                                        CHECK (ofac_status IN ('CLEAR', 'FLAGGED', 'ERROR', 'PENDING')),
                reviewed_by           INTEGER DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
                reviewed_at           TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla rental_applications creada');

        // ── 3. Crear índices ──────────────────────────────────────────────────
        console.log('Creando índices...');
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_applications_user_id
            ON rental_applications(user_id);
        `);
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_applications_warehouse_id
            ON rental_applications(warehouse_id);
        `);
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_applications_status
            ON rental_applications(status);
        `);
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_applications_ofac_status
            ON rental_applications(ofac_status);
        `);
        console.log('✅ Índices creados');

        console.log('\n✅ Migración completada exitosamente.');
        console.log('Ya puedes usar el endpoint POST /api/rental-applications');

    } catch (err) {
        console.error('❌ Error en la migración:', err);
    } finally {
        await sequelize.close();
    }
}

run();
