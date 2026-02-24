/**
 * Modelo Sequelize para la tabla 'refresh_tokens'
 * El refresh token se utiliza para renovar el access token sin que el usuario tenga que volver a iniciar sesión ya que 
 * el access token tiene una vida útil corta por razones de seguridad. El refresh token tiene una vida útil más larga y se almacena de forma segura en la base de datos.
 * 
 * Cada sesión/dispositivo tiene su propio refresh token lo que permite:
 * - revocar un token
 * - Ver que dispositivos está conectado el usuario
 * - invalidar todas las sesiones a la vez (revocar todos los tokens)
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { IRefreshToken, IRefreshTokenAttributes, IRefreshTokenCreationAttributes } from "../interfaces/interfaces.js";

class RefreshToken extends Model<IRefreshTokenAttributes, IRefreshTokenCreationAttributes> implements IRefreshToken {
    declare id: number;
    declare userId: number;
    declare token: string;
    declare expiresAt: Date;
    declare isRevoked: boolean;
    declare ipAddress: string | null;
    declare userAgent: string | null;
    declare readonly createdAt: Date;

    // Verifica si el token sigue siendo válido
    isValid(): boolean {
        return !this.isRevoked && new Date() < this.expiresAt;
    }
}

// Definición del modelo Sequelize
RefreshToken.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // Usuario al que pertenece el token
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Nombre de la tabla de usuarios
            key: 'id',
        }
    },
    token: { // El valor del refresh token
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true, // Cada token debe ser único
    },
    expiresAt: { // Fecha de expiración del token
        type: DataTypes.DATE,
        allowNull: false,
    },
    isRevoked: { // Indica si el token ha sido revocado
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'true = token revocado manualmente (logout)',
    },
    ipAddress: { // IP desde la que se generó el token 
        type: DataTypes.STRING(45), 
        allowNull: true,
        defaultValue: null,
        comment: 'IP desde la que se generó el token',
    },
    userAgent: { // Información del dispositivo/navegador
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: 'Información del dispositivo/navegador desde el que se generó el token',
    },
},
    {
        sequelize,          // Instancia de conexión a la base de datos
        tableName: 'refresh_tokens', // Nombre de la tabla en la base de datos
        modelName: 'RefreshToken',  // Nombre del modelo en Sequelize
        timestamps: true,   // Agrega createdAt automáticamente (no necesitamos updatedAt para tokens)
        updatedAt: false,   // No necesitamos updatedAt para este modelo
        underscored: true,  // Usa snake_case para los nombres de columnas
        comment: 'Tabla que almacena los refresh tokens para la autenticación de usuarios',

        indexes: [
            {
                fields: ['user_id'], // Buscar todos los tokens de un usuario (para revocar todos)
            },
            {
                fields: ['token'], // Buscar por token al momento de renovar el access token
            },
        ],
    },

);

export default RefreshToken;