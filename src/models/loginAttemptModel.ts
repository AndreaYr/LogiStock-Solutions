/**
 * Modelo Sequelize para la tabla 'login_attempts'
 * Registra todos los intentos de inicio de sesión, exitosos o fallidos
 * 
 * Casos de uso principales:
 *   1. BLOQUEO DE CUENTA: Si hay N intentos fallidos consecutivos
 *      del mismo email → bloquear temporalmente (configurable en env.ts:
 *      MAX_LOGIN_ATTEMPTS y LOCK_TIME_MINUTES)
 *
 *   2. DETECCIÓN DE FUERZA BRUTA: Si la misma IP tiene muchos intentos
 *      fallidos en poco tiempo → posible ataque, bloquear IP
 *
 *   3. AUDITORÍA: Registro permanente de quién accedió y cuándo,
 *      útil para investigaciones de seguridad
 *
 * NOTA: Esta tabla solo crece (INSERT), nunca se hacen UPDATE.
 *       Por eso timestamps solo tiene `attemptedAt`, no `updatedAt`.
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { ILoginAttempt, ILoginAttemptAttributes, ILoginAttemptCreationAttributes } from "../interfaces/interfaces.js";

class LoginAttempt extends Model<ILoginAttemptAttributes, ILoginAttemptCreationAttributes> implements ILoginAttempt {
    declare id: number;
    declare userId: number | null;
    declare email: string;
    declare success: boolean;
    declare ipAddress: string;
    declare userAgent: string | null;
    declare attemptedAt: Date;
};

// Definición del modelo Sequelize
LoginAttempt.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // FK -> users.id, es null si el email no existe en la BD
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
            model: 'users', // Nombre de la tabla de usuarios
            key: 'id',
        }
    },
    email: { // El email que se intentó ingresar se guarda aunque no exista en la BD para detectar intentos con emails no registrados
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Puede haber muchos intentos con el mismo email
        validate: {
            isEmail: true,
        }
    },
    success: { // Si el intento fue exitoso o no
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: 'true = intento exitoso, false = intento fallido',
    },
    ipAddress: { // IP desde la que se intentó iniciar sesión
        type: DataTypes.STRING(45), // IPv6 puede tener hasta 45 caracteres
        allowNull: false,
    },
    userAgent: { // Información del dispositivo/navegador desde el que se intentó iniciar sesión
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    attemptedAt: { // Por defecto usa la hora actual del servidor
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},{
    sequelize,
    tableName: 'login_attempts', // Nombre de la tabla en la base de datos
    modelName: 'LoginAttempt',
    timestamps: false, 
    underscored: true, 
    comment: 'Tabla de intentos de inicio de sesión, registra cada intento exitoso o fallido para seguridad y auditoría',

    indexes: [{
        fields: ['email'], // Índice para consultas por email (bloqueo de cuenta)
    },{
        fields: ['ip_address'], // Índice para consultas por IP (detección de fuerza bruta)
    },{
        fields: ['user_id'], // Busca todos los accesos de un usuario (auditoría)
    },{
        fields: ['attempted_at'], // Consultas por rango de tiempo
    }]
});

export default LoginAttempt;