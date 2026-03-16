import sequelize from '../config/database.js';

async function run() {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(`
        SELECT ra.id, ra.user_id, ra.warehouse_id, ra.status,
               rc.id AS contract_id
        FROM rental_applications ra
        LEFT JOIN rental_contracts rc ON rc.application_id = ra.id
        WHERE ra.status = 'APPROVED'
        ORDER BY ra.created_at DESC
    `);
    console.log('Solicitudes APPROVED:');
    console.log(JSON.stringify(rows, null, 2));
    await sequelize.close();
}

run().catch(console.error);
