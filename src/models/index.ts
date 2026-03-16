import Role from "./roleModel.js";
import User from "./userModel.js";
import RefreshToken from "./refreshTokenModel.js";
import LoginAttempt from "./loginAttemptModel.js";
import PaymentTransaction from "./paymentTransactionModel.js";
import Warehouse from './warehouseModel.js';
import Rental from './rentalModel.js';
import Notification from './notificationModel.js';
import Movement from './movementModel.js';
import Novelty from './noveltyModel.js';
import ServiceRequest from './serviceRequestModel.js';
import RentalApplication from './rentalApplicationModel.js';
import RentalContract from './rentalContractModel.js';

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

// -------------------- User - Novelty - Warehouse --------------------

// Un usuario (auxiliar/jefe) reporta novedades
User.hasMany(Novelty, {
    foreignKey: 'reportedBy',
    as: 'novelties',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Novelty.belongsTo(User, {
    foreignKey: 'reportedBy',
    as: 'reporter'
});

// Una bodega tiene muchas novedades
Warehouse.hasMany(Novelty, {
    foreignKey: 'warehouseId',
    as: 'novelties',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Novelty.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse'
});

// -------------------- User - ServiceRequest - Warehouse --------------------

// Un cliente crea solicitudes
User.hasMany(ServiceRequest, {
    foreignKey: 'userId',
    as: 'serviceRequests',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

ServiceRequest.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Una bodega recibe múltiples solicitudes de sus clientes
Warehouse.hasMany(ServiceRequest, {
    foreignKey: 'warehouseId',
    as: 'serviceRequests',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

ServiceRequest.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse'
});

// -------------------- User - RentalApplication - Warehouse --------------------

// Un usuario puede tener muchas solicitudes de arrendamiento
User.hasMany(RentalApplication, {
    foreignKey: 'userId',
    as: 'rentalApplications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RentalApplication.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// Una bodega puede recibir muchas solicitudes de arrendamiento
Warehouse.hasMany(RentalApplication, {
    foreignKey: 'warehouseId',
    as: 'rentalApplications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RentalApplication.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse',
});

// -------------------- RentalApplication - RentalContract --------------------

// Una solicitud aprobada genera exactamente un contrato
RentalApplication.hasOne(RentalContract, {
    foreignKey: 'applicationId',
    as: 'contract',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RentalContract.belongsTo(RentalApplication, {
    foreignKey: 'applicationId',
    as: 'application',
});

// Un cliente puede tener muchos contratos
User.hasMany(RentalContract, {
    foreignKey: 'userId',
    as: 'rentalContracts',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RentalContract.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

// Una bodega puede tener muchos contratos
Warehouse.hasMany(RentalContract, {
    foreignKey: 'warehouseId',
    as: 'rentalContracts',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

RentalContract.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse',
});

// PaymentTransaction no tiene FK con otras tablas por diseño:
// las transacciones de pago se identifican por 'reference' (orden externa)
export { Role, User, RefreshToken, LoginAttempt, PaymentTransaction, Warehouse, Rental, Notification, Movement, Novelty, ServiceRequest, RentalApplication, RentalContract };
