import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { INoveltyAttributes, INoveltyCreationAttributes, NoveltyType, NoveltyStatus } from "../interfaces/noveltyInterfaces.js";

class Novelty extends Model<INoveltyAttributes, INoveltyCreationAttributes> implements INoveltyAttributes {
    declare id: number;
    declare warehouseId: number;
    declare reportedBy: number;
    declare type: NoveltyType;
    declare product: string;
    declare quantity: number;
    declare description: string | null;
    declare status: NoveltyStatus;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Novelty.init(
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
        reportedBy: {
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
            type: DataTypes.ENUM(...Object.values(NoveltyType)),
            allowNull: false,
        },
        product: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(NoveltyStatus)),
            allowNull: false,
            defaultValue: NoveltyStatus.PENDING,
        },
    },
    {
        sequelize,
        tableName: 'novelties',
        timestamps: true,
        underscored: true,
    }
);

export default Novelty;
