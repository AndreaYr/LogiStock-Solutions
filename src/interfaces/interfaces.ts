/**
* Define las interfaces TypeScript para los modelos de autenticación.
* Estas interfaces describen la "forma" de cada entidad en la base de datos.
*
* Al extender de `Model`, Sequelize puede usar estas interfaces para
* tipar correctamente las instancias de cada modelo.
*/

import { Model, Optional } from "sequelize";

//-------------------------------- ENUMS ------------------------------

/**
 * Este enum se usa para garantizar que solo existan estos 4 valores (roles) en la BD
 */

export enum UserRole {
    ADMIN = 'admin',
    JEFE_BODEGA = 'warehouse_manager',
    AUXILIAR = 'assistant',
    CLIENTE = 'client',
}

//------------------------------ INTERFACE ------------------------------

/**
 * Interface IRole
 */

// Atributos completos de la tabla 'roles', representa un rol en el sistema
export interface IRoleAttributes {
    id: number;
    name: UserRole;                 // Nombre del rol (enum)
    description: string | null;     // Descripcion opcional del rol
    createdAt?: Date;
    updatedAt?: Date;
}

// Atributos opcionales al crear un rol. 'id' es opcional porque la BD lo genera automaticamente
export interface IRoleCreationAttributes extends Optional<IRoleAttributes, 'id'> { }

// Extiende Model para tener acceso a los métodos de Sequelize
export interface IRole extends Model<IRoleAttributes, IRoleCreationAttributes>, IRoleAttributes { }


//-----------------------------------------------------------------------------

/**
 * Interface IUser
 */

// Atributos completos de la tabla 'users', representa cualquier usuario en el sistema
export interface IUserAttributes {
    id: number;
    roleId: number;         // FK -> roles.id
    firstName: string;
    lastName: string;
    phone: string | null;   // opcional
    email: string;
    password: string;
    documentId: string | null; // Nuevo: Documento de identidad
    address: string | null;    // Nuevo: Dirección
    isActive: boolean;      // Si la cuenta está activa o deshabilitada
    isVerified: boolean;    // Si el email fue verificado
    lastLogin: Date | null; // Ultima vez que inició sesión
    createdAt?: Date;
    updatedAt?: Date;
}

// Atributos opcionales al crear un User: id, phone, lastLogin, documentId, address
export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'phone' | 'lastLogin' | 'documentId' | 'address'> { }

// Interface final del modelo User
export interface IUser extends Model<IUserAttributes, IUserCreationAttributes>, IUserAttributes { }

//-----------------------------------------------------------------------------

/**
 * Interface IRefreshToken
 */

// Atributos completos de la tabla 'refresh_tokens', los refresh tokens permiten renovar el access token sin que el usuario tenga que volver a iniciar sesión
export interface IRefreshTokenAttributes {
    id: number;
    userId: number;         // FK -> users.id
    token: string;          // El valor del refresh token
    expiresAt: Date;        // Fecha de expiración del refresh token
    isRevoked: boolean;     // Si el token ha sido revocado (logout)
    ipAddress: string | null;      // IP desde donde se generó el token
    userAgent: string | null;     // Información del navegador/dispositivo
    createdAt?: Date;
}

// Atributos opcionales al crear un RefreshToken: id, ipAddress, userAgent
export interface IRefreshTokenCreationAttributes extends Optional<IRefreshTokenAttributes, 'id' | 'ipAddress' | 'userAgent'> { }

// Interface final del modelo RefreshToken
export interface IRefreshToken extends Model<IRefreshTokenAttributes, IRefreshTokenCreationAttributes>, IRefreshTokenAttributes { }

//-----------------------------------------------------------------------------


/**
 * Interface ILoginAttempt
 */

/* Atributos completos de la tabla 'login_attempts', registra cada intento de inicio de sesión (exitoso o fallido. Sirve para:
 * - Bloquear cuentas después de N intentos fallidos
 * - Analizar patrones de acceso sospechosos
 * - Auditar accesos al sistema
 */
export interface ILoginAttemptAttributes {
    id: number;
    userId: number | null;  // FK -> users.id es null si el email no existe en la BD
    email: string;          // El email que se intentó ingresar
    success: boolean;       // Si el intento fue exitoso o no
    ipAddress: string;      // IP desde donde se intentó iniciar sesión
    userAgent: string | null;     // Información del navegador/dispositivo
    attemptedAt: Date;      // Fecha y hora del intento
}

// Atributos opcionales al crear un LoginAttempt: id, userAgent
export interface ILoginAttemptCreationAttributes extends Optional<ILoginAttemptAttributes, 'id' | 'userAgent'> { }

// Interface final del modelo LoginAttempt
export interface ILoginAttempt extends Model<ILoginAttemptAttributes, ILoginAttemptCreationAttributes>, ILoginAttemptAttributes { }