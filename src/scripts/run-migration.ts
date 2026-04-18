import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function addCancellationFields() {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    const [columns] = await sequelize.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = 'users' AND column_name = 'cancellation_date'`,
        { type: QueryTypes.SELECT }
    ) as any[];

    if (columns) {
        console.log('ℹ️  Las columnas ya existen. Nada que hacer.');
        await sequelize.close();
        return;
    }

    await sequelize.query(
        `ALTER TABLE users
         ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMP WITH TIME ZONE,
         ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN NOT NULL DEFAULT false`
    );

    console.log('✅ Columnas cancellation_date e is_anonymized agregadas a la tabla users.');
    await sequelize.close();
}

addCancellationFields().catch((err) => {
    console.error('❌ Error al correr la migración:', err.message);
    process.exit(1);
});
