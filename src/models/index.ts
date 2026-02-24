import Role from "./roleModel.js";
import User from "./userModel.js";
import RefreshToken from "./refreshTokenModel.js";
import LoginAttempt from "./loginAttemptModel.js";

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

export { Role, User, RefreshToken, LoginAttempt };