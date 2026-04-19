/**
 * Modelo Sequelize para la tabla "users". Representa a cualquier usuario del sistema independientemente de su rol.
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { IUser, IUserAttributes, IUserCreationAttributes } from "../interfaces/interfaces.js";

class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUser {
    declare id: number;
    declare roleId: number;
    declare firstName: string;
    declare lastName: string;
    declare phone: string | null;
    declare email: string;
    declare password: string;
    declare resetPasswordToken: string | null;
    declare resetPasswordExpires: Date | null;
    declare emailVerificationToken: string | null;    // Token hasheado para verificar el email
    declare emailVerificationExpires: Date | null;    // Expiración del token (24h)
    declare otpCode: string | null;                   // Código OTP hasheado (SHA-256) para 2FA
    declare otpExpires: Date | null;                  // Expiración del OTP (10 minutos)
    declare isActive: boolean;
    declare isVerified: boolean;
    declare lastLogin: Date | null;
    declare cancellationDate: Date | null;
    declare isAnonymized: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    //Método para obtener el nombre completo del usuario -> user.getFullName()
    getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}

// Iniciamos el modelo con sus atributos y opciones
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles', // Nombre de la tabla referenciada
                key: 'id',     // Columna referenciada
            },
            comment: 'ID del rol asignado al usuario',
        },
        firstName: {
            type: DataTypes.STRING(70),
            allowNull: false,
            comment: 'Nombre del usuario',
        },
        lastName: {
            type: DataTypes.STRING(70),
            allowNull: false,
            comment: 'Apellido del usuario',
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            comment: 'Número de teléfono del usuario (opcional)',
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true, // Cada email debe ser único en la tabla
            validate: {
                isEmail: true,
            },
            comment: 'Correo electrónico del usuario, debe ser único',
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Hash bcrypt de la contraseña del usuario',
        },
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            comment: 'Token para recuperación de contraseña',
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha de expiración del token de recuperación',
        },
        // Token hasheado (SHA-256) para verificar el email al registrarse
        emailVerificationToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            comment: 'Token hasheado para verificar el email del usuario',
        },
        // Expiración del token de verificación (24 horas desde el registro)
        emailVerificationExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha de expiración del token de verificación de email (24h)',
        },
        // Código OTP hasheado (SHA-256) generado al iniciar sesión para la verificación en 2 pasos
        otpCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            comment: 'Código OTP hasheado para autenticación en 2 pasos',
        },
        // Fecha de expiración del OTP (10 minutos desde su generación)
        otpExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha de expiración del OTP (10 minutos)',
        },
        // Indica si la cuenta está habilitada o deshabilitada por el admin.
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Si la cuenta está activa. False = cuenta desactivada por admin',
        },
        // Indica si el usuario ha verificado su email. Un usuario no verificado no puede iniciar sesión.
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Si el usuario ha verificado su email. Un usuario no verificado no puede iniciar sesión',
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha y hora del último inicio de sesión del usuario',
        },
        cancellationDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha en que el usuario canceló su suscripción. Null si está activo.',
        },
        isAnonymized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'True cuando los datos del usuario fueron anonimizados definitivamente.',
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true, // createdAt y updatedAt se gestionan automáticamente
        underscored: true, // usa snake_case para los nombres de columnas
        comment: 'Tabla que almacena la información de los usuarios del sistema',

        // indices para optimizar consultas frecuentes
        indexes: [
            {
                unique: true,
                fields: ['email'], // Índice único para el email
            },
            {
                fields: ['role_id'], // Índice para consultas por rol
            },
        ],
    }
);

export default User;