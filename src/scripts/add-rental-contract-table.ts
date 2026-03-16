/**
 * Script de migración — crea la tabla rental_contracts.
 * Ejecutar una sola vez: npx tsx src/scripts/add-rental-contract-table.ts
 */

import sequelize from '../config/database.js';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // ── 1. Crear tabla rental_contracts ───────────────────────────────────
        console.log('Creando tabla rental_contracts...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS rental_contracts (
                id                      SERIAL PRIMARY KEY,
                application_id          INTEGER NOT NULL UNIQUE
                                            REFERENCES rental_applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
                user_id                 INTEGER NOT NULL
                                            REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                warehouse_id            INTEGER NOT NULL
                                            REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE,
                contract_pdf_path       VARCHAR(500) NOT NULL,
                document_photo_path     VARCHAR(500) DEFAULT NULL,
                client_signature_path   VARCHAR(500) DEFAULT NULL,
                admin_signature_path    VARCHAR(500) DEFAULT NULL,
                contract_hash           VARCHAR(64) DEFAULT NULL,
                status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING_CLIENT'
                                            CHECK (status IN ('PENDING_CLIENT', 'PENDING_ADMIN', 'SIGNED', 'CANCELLED')),
                client_signed_at        TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                admin_signed_at         TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla rental_contracts creada');

        // ── 2. Crear índices ──────────────────────────────────────────────────
        console.log('Creando índices...');
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_contracts_user_id
            ON rental_contracts(user_id);
        `);
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_contracts_warehouse_id
            ON rental_contracts(warehouse_id);
        `);
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_rental_contracts_status
            ON rental_contracts(status);
        `);
        console.log('✅ Índices creados');

        console.log('\n✅ Migración completada exitosamente.');
        console.log('Ya puedes usar los endpoints /api/contracts');

    } catch (err) {
        console.error('❌ Error en la migración:', err);
    } finally {
        await sequelize.close();
    }
}

run();
