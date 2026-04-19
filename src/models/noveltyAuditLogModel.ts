import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type NoveltyAuditAction = 'CREATE' | 'UPDATE_STATUS';

interface NoveltyAuditLogAttributes {
    id: bigint;
    noveltyId: number | null;
    changedBy: number | null;
    action: NoveltyAuditAction;
    previousStatus: string | null;
    newStatus: string | null;
    metadata: object | null;
    createdAt: Date;
}

interface NoveltyAuditLogCreationAttributes extends Optional<NoveltyAuditLogAttributes,
    'id' | 'noveltyId' | 'changedBy' | 'previousStatus' | 'newStatus' | 'metadata' | 'createdAt'> { }

class NoveltyAuditLog extends Model<NoveltyAuditLogAttributes, NoveltyAuditLogCreationAttributes> {
    declare id: bigint;
    declare noveltyId: number | null;
    declare changedBy: number | null;
    declare action: NoveltyAuditAction;
    declare previousStatus: string | null;
    declare newStatus: string | null;
    declare metadata: object | null;
    declare readonly createdAt: Date;
}

NoveltyAuditLog.init(
    {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        noveltyId: { type: DataTypes.INTEGER, allowNull: true },
        changedBy: { type: DataTypes.INTEGER, allowNull: true },
        action: { type: DataTypes.STRING(60), allowNull: false },
        previousStatus: { type: DataTypes.STRING(50), allowNull: true },
        newStatus: { type: DataTypes.STRING(50), allowNull: true },
        metadata: { type: DataTypes.JSONB, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'NoveltyAuditLog',
        tableName: 'novelty_audit_log',
        timestamps: false,
        underscored: true,
    }
);

export default NoveltyAuditLog;
