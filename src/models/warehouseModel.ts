import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface que define todos los atributos de la tabla Warehouse
export interface IWarehouseAttributes {
    id: number;
    description: string;
    capacityOccupied: number;
    address: string | null;
    postalCode: string | null;
    storageLength: number | null;
    storageWidth: number | null;
    storageHeight: number | null;
    imageUrl: string | null;
    monthlyPrice: number;
}

// Interface para creación (id opcional generado por DB)
export interface IWarehouseCreationAttributes extends Optional<IWarehouseAttributes, 'id' | 'storageLength' | 'storageWidth' | 'storageHeight' | 'postalCode' | 'address' | 'imageUrl' | 'monthlyPrice'> { }

// Interface Final del Modelo
export interface IWarehouse extends Model<IWarehouseAttributes, IWarehouseCreationAttributes>, IWarehouseAttributes { }

class Warehouse extends Model<IWarehouseAttributes, IWarehouseCreationAttributes> implements IWarehouse {
    declare id: number;
    declare description: string;
    declare capacityOccupied: number;
    declare address: string | null;
    declare postalCode: string | null;
    declare storageLength: number | null;
    declare storageWidth: number | null;
    declare storageHeight: number | null;
    declare imageUrl: string | null;
    declare monthlyPrice: number;
}

Warehouse.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    capacityOccupied: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    storageLength: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    storageWidth: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    storageHeight: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    monthlyPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    }
}, {
    sequelize,
    modelName: 'Warehouse',
    tableName: 'warehouses',
    timestamps: false,
    underscored: true,
});

export default Warehouse;
