import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function createAuditTables() {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    const tables = [
        {
            name: 'user_audit_log',
            sql: `CREATE TABLE IF NOT EXISTS user_audit_log (
                id BIGSERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(60) NOT NULL,
                changes JSONB,
                reason VARCHAR(500),
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
        },
        {
            name: 'service_request_audit_log',
            sql: `CREATE TABLE IF NOT EXISTS service_request_audit_log (
                id BIGSERIAL PRIMARY KEY,
                request_id INTEGER REFERENCES service_requests(id) ON DELETE SET NULL,
                changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(60) NOT NULL,
                previous_status VARCHAR(50),
                new_status VARCHAR(50),
                reason VARCHAR(500),
                metadata JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
        },
        {
            name: 'warehouse_audit_log',
            sql: `CREATE TABLE IF NOT EXISTS warehouse_audit_log (
                id BIGSERIAL PRIMARY KEY,
                warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
                changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(60) NOT NULL,
                changes JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
        },
        {
            name: 'novelty_audit_log',
            sql: `CREATE TABLE IF NOT EXISTS novelty_audit_log (
                id BIGSERIAL PRIMARY KEY,
                novelty_id INTEGER REFERENCES novelties(id) ON DELETE SET NULL,
                changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(60) NOT NULL,
                previous_status VARCHAR(50),
                new_status VARCHAR(50),
                metadata JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
        },
        {
            name: 'report_access_log',
            sql: `CREATE TABLE IF NOT EXISTS report_access_log (
                id BIGSERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                report_type VARCHAR(100) NOT NULL,
                params JSONB,
                ip_address VARCHAR(45),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
        },
    ];

    for (const table of tables) {
        const [existing] = await sequelize.query(
            `SELECT table_name FROM information_schema.tables WHERE table_name = '${table.name}'`,
            { type: QueryTypes.SELECT }
        ) as any[];

        if (existing) {
            console.log(`ℹ️  Tabla ${table.name} ya existe.`);
        } else {
            await sequelize.query(table.sql);
            console.log(`✅ Tabla ${table.name} creada.`);
        }
    }

    await sequelize.close();
    console.log('\n🎉 Migración de auditoría completada.');
}

createAuditTables().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
