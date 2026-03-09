import Role from "./roleModel.js";
import User from "./userModel.js";
import RefreshToken from "./refreshTokenModel.js";
import LoginAttempt from "./loginAttemptModel.js";
import PaymentTransaction from "./paymentTransactionModel.js";
import Warehouse from './warehouseModel.js';
import Rental from './rentalModel.js';
import Notification from './notificationModel.js';
import Movement from './movementModel.js';

// -------------------- Role - User --------------------

// Un rol puede tener muchos usuarios
Role.hasMany(User, {
    foreignKey: 'roleId',
    as: 'users',
    onDelete: 'RESTRICT', // No permitir eliminar un rol si tiene usuarios asociados
    onUpdate: 'CASCADE'
});

// Un usuario pertenece a un rol
User.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
});

// -------------------- User - RefreshToken --------------------

// Un usuario puede tener muchos refresh tokens
User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens',
    onDelete: 'CASCADE', // Si elimina el usuario, se eliminan sus tokens
    onUpdate: 'CASCADE'
});

// Un refresh token pertenece a un usuario
RefreshToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// -------------------- User - LoginAttempt --------------------

// Un usuario puede tener muchos registros de intentos de inicio de sesión
User.hasMany(LoginAttempt, {
    foreignKey: 'userId',
    as: 'loginAttempts',
    onDelete: 'SET NULL', // Si elimina el usuario, se eliminan sus intentos de inicio de sesión
    onUpdate: 'CASCADE', // Se conserva pero con el valor null
});

// Un LoginAttempt pertenece a un usuario o a ninguno si userId es null
LoginAttempt.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// -------------------- User - Rental - Warehouse --------------------

// A user can have many rentals
User.hasMany(Rental, {
    foreignKey: 'userId',
    as: 'rentals',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Rental.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// A warehouse can have many rental records (history)
Warehouse.hasMany(Rental, {
    foreignKey: 'warehouseId',
    as: 'rentals',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Rental.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse'
});

// -------------------- User - Notification --------------------

// Un usuario puede tener muchas notificaciones
User.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Notification.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// -------------------- User - Movement - Warehouse --------------------

// Un usuario (manager/auxiliar) registra movimientos
User.hasMany(Movement, {
    foreignKey: 'userId',
    as: 'movements',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Movement.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Una bodega tiene muchos movimientos de inventario
Warehouse.hasMany(Movement, {
    foreignKey: 'warehouseId',
    as: 'movements',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Movement.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse'
});

// PaymentTransaction no tiene FK con otras tablas por diseño:
// las transacciones de pago se identifican por 'reference' (orden externa)
export { Role, User, RefreshToken, LoginAttempt, PaymentTransaction, Warehouse, Rental, Notification, Movement };
