import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { IServiceRequestAttributes, IServiceRequestCreationAttributes, ServiceRequestType, ServiceRequestStatus } from "../interfaces/serviceRequestInterfaces.js";

class ServiceRequest extends Model<IServiceRequestAttributes, IServiceRequestCreationAttributes> implements IServiceRequestAttributes {
    declare id: number;
    declare warehouseId: number;
    declare userId: number;
    declare type: ServiceRequestType;
    declare product: string | null;
    declare quantity: number | null;
    declare description: string | null;
    declare status: ServiceRequestStatus;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ServiceRequest.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        warehouseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'warehouses',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
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
        type: {
            type: DataTypes.ENUM(...Object.values(ServiceRequestType)),
            allowNull: false,
        },
        product: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ServiceRequestStatus)),
            allowNull: false,
            defaultValue: ServiceRequestStatus.PENDING,
        },
    },
    {
        sequelize,
        tableName: 'service_requests',
        timestamps: true,
        underscored: true,
    }
);

export default ServiceRequest;
