import sequelize from '../config/database.js';
import '../models/index.js';
import { Role, User } from '../models/index.js';
import { UserRole } from '../interfaces/interfaces.js';

async function verifyRoles() {
    try {
        console.log('--- VERIFICANDO ROLES ---');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa.');

        // Listar todos los roles
        const roles = await Role.findAll();
        console.log('\n📋 Roles en la BD:');
        roles.forEach(r => {
            console.log(`  - ID: ${r.id}, Nombre: ${r.name}`);
        });

        // Listar usuarios y sus roles
        const users = await User.findAll({
            include: [
                { association: 'role', attributes: ['id', 'name'] }
            ],
            attributes: ['id', 'email', 'firstName', 'lastName', 'roleId'],
            limit: 20
        });
        console.log('\n👥 Usuarios y sus roles:');
        users.forEach(u => {
            const roleObj = (u as any).role;
            console.log(`  - ${u.email}: roleId=${u.roleId}, role=${roleObj?.name || 'SIN ROLE'}`);
        });

        // Verificar that all UserRole values exist in DB
        console.log('\n🔍 Verificando que existan todos los roles requeridos:');
        const requiredRoles = Object.values(UserRole);
        for (const roleName of requiredRoles) {
            const role = await Role.findOne({ where: { name: roleName } });
            if (role) {
                console.log(`  ✅ ${roleName} existe (ID: ${role.id})`);
            } else {
                console.log(`  ❌ ${roleName} NO EXISTE - creando...`);
                await Role.create({ name: roleName });
                console.log(`     ✅ ${roleName} creado`);
            }
        }

        console.log('\n✅ ¡Verificación completada!');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
}

verifyRoles();
