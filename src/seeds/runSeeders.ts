import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { Role, User, Warehouse, Rental } from '../models/index.js';
import { UserRole } from '../interfaces/interfaces.js';

const seedDatabase = async () => {
    try {
        console.log('⏳ Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // 1. Ensure tables exist
        await sequelize.sync();

        console.log('⏳ Seeding Roles...');
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
        console.log('✅ Roles created successfully.');

        console.log('⏳ Seeding Users...');
        // Default password hash
        const hashedPassword = await bcrypt.hash('cliente1234', 12);

        const adminRole = await Role.findOne({ where: { name: UserRole.ADMIN } });
        const managerRole = await Role.findOne({ where: { name: UserRole.JEFE_BODEGA } });
        const operatorRole = await Role.findOne({ where: { name: UserRole.AUXILIAR } });
        const clientRole = await Role.findOne({ where: { name: UserRole.CLIENTE } });

        const users = [
            {
                roleId: clientRole!.id,
                firstName: 'Client',
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
                firstName: 'Manager',
                lastName: 'Warehouse',
                email: 'manager1@gmail.com',
                password: hashedPassword,
                isActive: true,
                isVerified: true,
                phone: '3001112233'
            },
            {
                roleId: operatorRole!.id,
                firstName: 'Assistant',
                lastName: 'Operator',
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
                console.log(`- User ${userData.email} (Role: ${userData.roleId}) created.`);
            }
        }
        console.log('✅ Users created successfully.');

        console.log('⏳ Seeding Warehouses...');
        const imageUrls = [
            'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop'
        ];

        for (let i = 1; i <= 20; i++) {
            const randomImg = imageUrls[Math.floor(Math.random() * imageUrls.length)];
            const randomCapacity = Math.floor(Math.random() * 5000) + 1000;

            await Warehouse.findOrCreate({
                where: { description: `LogiStock Warehouse ${i}` },
                defaults: {
                    description: `LogiStock Warehouse ${i}`,
                    capacityOccupied: Math.floor(Math.random() * randomCapacity),
                    address: `Logstics Street ${i} #40-20`,
                    postalCode: `1102${Math.floor(Math.random() * 90) + 10}`,
                    storageLength: Math.floor(Math.random() * 50) + 10,
                    storageWidth: Math.floor(Math.random() * 40) + 10,
                    storageHeight: Math.floor(Math.random() * 10) + 3,
                    imageUrl: randomImg,
                    monthlyPrice: Math.floor(Math.random() * 4000) + 1000  // Entre $1.000 y $5.000 para pruebas
                }
            });
        }
        console.log('✅ 20 Warehouses created.');

        console.log('⏳ Seeding sample Rentals...');
        const demoUser = await User.findOne({ where: { email: 'cliente1@gmail.com' } });
        const sampleWarehouses = await Warehouse.findAll({ limit: 3 });

        if (demoUser && sampleWarehouses.length > 0) {
            for (const warehouse of sampleWarehouses) {
                await Rental.findOrCreate({
                    where: { userId: demoUser.id, warehouseId: warehouse.id },
                    defaults: {
                        userId: demoUser.id,
                        warehouseId: warehouse.id,
                        startDate: new Date(),
                        monthlyAmount: 150000 + (Math.random() * 50000),
                        status: 'ACTIVE'
                    }
                });
            }
            console.log(`✅ 3 Rentals created for ${demoUser.email}.`);
        }

        console.log('🎉 Seeding finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error executing seeder:', error);
        process.exit(1);
    }
};

seedDatabase();

