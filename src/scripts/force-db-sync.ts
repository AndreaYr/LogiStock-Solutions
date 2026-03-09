import sequelize from '../config/database.js';
import '../models/index.js'; // Importamos modelos para que Sequelize los conozca

async function forceSync() {
    try {
        console.log('--- FORZANDO SINCRONIZACIÓN DE BASE DE DATOS ---');
        console.log('Conectando a:', process.env.DB_HOST);

        await sequelize.authenticate();
        console.log('✅ Conexión exitosa.');

        console.log('Iniciando sync con { alter: true }...');
        await sequelize.sync({ alter: true });

        console.log('✅ ¡Sincronización completada con éxito!');
        console.log('Las columnas faltantes deberían estar ahora en la base de datos.');

    } catch (error) {
        console.error('❌ ERROR durante la sincronización:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

forceSync();
