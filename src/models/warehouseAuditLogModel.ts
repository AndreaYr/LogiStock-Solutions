import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type WarehouseAuditAction = 'CREATE' | 'UPDATE' | 'TOGGLE_STATUS' | 'UPLOAD_IMAGES';

interface WarehouseAuditLogAttributes {
    id: bigint;
    warehouseId: number | null;
    changedBy: number | null;
    action: WarehouseAuditAction;
    changes: object | null;
    createdAt: Date;
}

interface WarehouseAuditLogCreationAttributes extends Optional<WarehouseAuditLogAttributes,
    'id' | 'warehouseId' | 'changedBy' | 'changes' | 'createdAt'> { }

class WarehouseAuditLog extends Model<WarehouseAuditLogAttributes, WarehouseAuditLogCreationAttributes> {
    declare id: bigint;
    declare warehouseId: number | null;
    declare changedBy: number | null;
    declare action: WarehouseAuditAction;
    declare changes: object | null;
    declare readonly createdAt: Date;
}

WarehouseAuditLog.init(
    {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        warehouseId: { type: DataTypes.INTEGER, allowNull: true },
        changedBy: { type: DataTypes.INTEGER, allowNull: true },
        action: { type: DataTypes.STRING(60), allowNull: false },
        changes: { type: DataTypes.JSONB, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'WarehouseAuditLog',
        tableName: 'warehouse_audit_log',
        timestamps: false,
        underscored: true,
    }
);

export default WarehouseAuditLog;
