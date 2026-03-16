/**
 * Genera contratos para solicitudes APPROVED que aún no tienen contrato.
 * Ejecutar una sola vez: npx tsx src/scripts/generate-missing-contracts.ts
 */

// Importar modelos para inicializar asociaciones
import '../models/index.js';
import sequelize from '../config/database.js';
import rentalContractService from '../services/rentalContractService.js';

async function run() {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const [rows] = await sequelize.query(`
        SELECT ra.id
        FROM rental_applications ra
        LEFT JOIN rental_contracts rc ON rc.application_id = ra.id
        WHERE ra.status = 'APPROVED' AND rc.id IS NULL
        ORDER BY ra.created_at ASC
    `) as [{ id: number }[], unknown];

    if (rows.length === 0) {
        console.log('No hay solicitudes APPROVED sin contrato.');
        await sequelize.close();
        return;
    }

    console.log(`Encontradas ${rows.length} solicitudes sin contrato:\n`);

    for (const row of rows) {
        try {
            const contract = await rentalContractService.generateForApplication(row.id);
            console.log(`✅ Contrato #${contract.id} generado para solicitud #${row.id}`);
        } catch (err: any) {
            console.error(`❌ Error en solicitud #${row.id}: ${err.message}`);
        }
    }

    console.log('\n✅ Proceso completado.');
    await sequelize.close();
}

run().catch(console.error);
