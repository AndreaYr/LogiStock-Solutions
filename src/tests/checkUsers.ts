import sequelize from '../config/database.js';
import User from '../models/userModel.js';

async function checkUsers() {
    try {
        console.log('Intentando conectar a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida con éxito.');

        const users = await User.findAll({
            attributes: ['id', 'email', 'firstName', 'roleId', 'isActive']
        });

        console.log(`\nSe encontraron ${users.length} usuarios en la base de datos:`);
        if (users.length > 0) {
            console.table(users.map(u => ({
                ID: u.id,
                Email: u.email,
                Nombre: u.firstName,
                RolID: u.roleId,
                Activo: u.isActive
            })));
        } else {
            console.log('La tabla de usuarios está vacía.');
        }

    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', (error as Error).message);
    } finally {
        process.exit(0);
    }
}

checkUsers();
