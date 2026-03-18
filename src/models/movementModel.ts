import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type MovementType = 'ENTRADA' | 'SALIDA' | 'TRASLADO';

export type PhotoData = {
    url: string;
    uploadedAt: string;
    description?: string;
};

export interface IMovementAttributes {
    id: number;
    warehouseId: number;
    userId: number;
    type: MovementType;
    product: string;
    quantity: number;
    description: string | null;
    serviceRequestId?: number | null;  // FK a service_requests, solo cuando se ejecuta una orden aprobada
    photos?: PhotoData[] | null;  // Array de fotos (JSON)
    observations?: string | null;  // Observaciones adicionales del auxiliar
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMovementCreationAttributes extends Optional<IMovementAttributes, 'id' | 'description' | 'serviceRequestId' | 'photos' | 'observations'> { }

class Movement extends Model<IMovementAttributes, IMovementCreationAttributes> implements IMovementAttributes {
    declare id: number;
    declare warehouseId: number;
    declare userId: number;
    declare type: MovementType;
    declare product: string;
    declare quantity: number;
    declare description: string | null;
    declare serviceRequestId: number | null;
    declare photos: PhotoData[] | null;
    declare observations: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Movement.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'warehouses', key: 'id' },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    type: {
        type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'TRASLADO'),
        allowNull: false,
    },
    product: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    serviceRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'service_requests', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    photos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Movement',
    tableName: 'movements',
    timestamps: true,
    underscored: true,
});

export default Movement;
