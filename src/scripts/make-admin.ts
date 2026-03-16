import sequelize from '../config/database.js';
import { User, Role } from '../models/index.js';
import { UserRole } from '../interfaces/interfaces.js';

const EMAIL = 'yuriramirez5800@gmail.com';

async function run() {
    await sequelize.authenticate();
    const adminRole = await Role.findOne({ where: { name: UserRole.ADMIN } });
    if (!adminRole) { console.error('❌ Rol ADMIN no encontrado'); return; }

    const [updated] = await User.update(
        { roleId: adminRole.id },
        { where: { email: EMAIL } }
    );

    if (updated) {
        console.log(`✅ Usuario ${EMAIL} ahora es ADMIN`);
    } else {
        console.log(`❌ No se encontró un usuario con el email: ${EMAIL}`);
    }
    await sequelize.close();
}

run();
