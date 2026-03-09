import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { IAlquilerAttributes, IAlquilerCreationAttributes } from "../interfaces/alquilerInterfaces.js";

/**
 * Modelo Sequelize para la tabla 'alquileres'.
 * Representa la relación de alquiler entre un usuario y una bodega.
 */
class Alquiler extends Model<IAlquilerAttributes, IAlquilerCreationAttributes> implements IAlquilerAttributes {
    declare id: number;
    declare userId: number;
    declare bodegaId: number;
    declare fechaInicio: Date;
    declare fechaFin: Date | null;
    declare montoMensual: number;
    declare estado: 'ACTIVO' | 'FINALIZADO' | 'PENDIENTE_PAGO';
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Alquiler.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        bodegaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'bodegas',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        fechaInicio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        montoMensual: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('ACTIVO', 'FINALIZADO', 'PENDIENTE_PAGO'),
            allowNull: false,
            defaultValue: 'ACTIVO',
        },
    },
    {
        sequelize,
        tableName: 'alquileres',
        timestamps: true,
        underscored: true,
    }
);

export default Alquiler;
