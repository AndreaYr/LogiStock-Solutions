import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import Role from '../models/roleModel.js';
import User from '../models/userModel.js';
import { UserRole } from '../interfaces/interfaces.js';
import Bodega from '../models/bodegaModel.js';

const seedDatabase = async () => {
    try {
        console.log('⏳ Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada.');

        // 1. Asegurar que las tablas existan
        await sequelize.sync();

        console.log('⏳ Poblando Roles...');
        const roles = [
            { name: UserRole.ADMIN, description: 'Administrador del sistema LogiStock' },
            { name: UserRole.JEFE_BODEGA, description: 'Jefe encargado de gestionar una bodega' },
            { name: UserRole.AUXILIAR, description: 'Auxiliar de bodega para operaciones' },
            { name: UserRole.CLIENTE, description: 'Cliente que requiere almacenar stock' },
        ];

        for (const roleData of roles) {
            await Role.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData
            });
        }
        console.log('✅ Roles creados exitosamente.');

        console.log('⏳ Poblando Usuarios...');
        // Hash de contraseña por defecto para todos
        const hashedPassword = await bcrypt.hash('cliente1234', 12);

        // Mapear los roles de la base de datos para obtener sus IDs reales
        const adminRole = await Role.findOne({ where: { name: UserRole.ADMIN } });
        const managerRole = await Role.findOne({ where: { name: UserRole.JEFE_BODEGA } });
        const operatorRole = await Role.findOne({ where: { name: UserRole.AUXILIAR } });
        const clientRole = await Role.findOne({ where: { name: UserRole.CLIENTE } });

        const users = [
            {
                roleId: clientRole!.id,
                firstName: 'Cliente',
                lastName: 'Demo',
                email: 'cliente1@gmail.com',
                password: hashedPassword,
                isActive: true,
                isVerified: true,
                phone: '3001234567'
            },
            {
                roleId: adminRole!.id,
                firstName: 'Admin',
                lastName: 'Demo',
                email: 'admin1@gmail.com',
                password: hashedPassword,
                isActive: true,
                isVerified: true,
                phone: '3009876543'
            },
            {
                roleId: managerRole!.id,
                firstName: 'Jefe',
                lastName: 'Bodega',
                email: 'manager1@gmail.com',
                password: hashedPassword,
                isActive: true,
                isVerified: true,
                phone: '3001112233'
            },
            {
                roleId: operatorRole!.id,
                firstName: 'Auxiliar',
                lastName: 'Operador',
                email: 'operator1@gmail.com',
                password: hashedPassword,
                isActive: true,
                isVerified: true,
                phone: '3004445566'
            }
        ];

        for (const userData of users) {
            const [user, created] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData
            });
            if (created) {
                console.log(`- Usuario ${userData.email} (Rol: ${userData.roleId}) creado con éxito.`);
            }
        }
        console.log('✅ Usuarios creados exitosamente.');

        console.log('⏳ Poblando Bodegas...');
        const imageUrls = [
            'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop'
        ];


        for (let i = 1; i <= 20; i++) {
            const randomImg = imageUrls[Math.floor(Math.random() * imageUrls.length)];
            const capacidadRandom = Math.floor(Math.random() * 5000) + 1000; // Entre 1000 y 6000

            await Bodega.findOrCreate({
                where: { descripcion: `Bodega LogiStock ${i}` },
                defaults: {
                    descripcion: `Bodega LogiStock ${i}`,
                    capacidadOcupado: Math.floor(Math.random() * capacidadRandom), // Ocupación debe ser menor
                    direccion: `Calle Logística ${i} #40-20`,
                    codigoPostal: `1102${Math.floor(Math.random() * 90) + 10}`, // 110210 a 110299
                    largoAlmacenamiento: Math.floor(Math.random() * 50) + 10,
                    anchoAlmacenamiento: Math.floor(Math.random() * 40) + 10,
                    altoAlmacenamiento: Math.floor(Math.random() * 10) + 3,
                    imagenUrl: randomImg
                }
            });
        }
        console.log('✅ 20 Bodegas creadas exitosamente.');

        console.log('🎉 Seeding finalizado con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando el seeder:', error);
        process.exit(1);
    }
};

seedDatabase();
