import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { IRentalAttributes, IRentalCreationAttributes } from "../interfaces/rentalInterfaces.js";

/**
 * Sequelize model for the 'rentals' table.
 * Represents the rental relationship between a user and a warehouse.
 */
class Rental extends Model<IRentalAttributes, IRentalCreationAttributes> implements IRentalAttributes {
    declare id: number;
    declare userId: number;
    declare warehouseId: number;
    declare startDate: Date;
    declare endDate: Date | null;
    declare monthlyAmount: number;
    declare status: 'ACTIVE' | 'FINISHED' | 'PENDING_PAYMENT';
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Rental.init(
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
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        monthlyAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'FINISHED', 'PENDING_PAYMENT'),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
    },
    {
        sequelize,
        tableName: 'rentals',
        timestamps: true,
        underscored: true,
    }
);

export default Rental;
