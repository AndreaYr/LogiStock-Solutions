import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type UserAuditAction =
    | 'REGISTER' | 'UPDATE_PROFILE' | 'CHANGE_PASSWORD'
    | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'
    | 'CANCEL' | 'RECOVER' | 'DEACTIVATE' | 'ANONYMIZE'
    | 'VERIFY_EMAIL';

interface UserAuditLogAttributes {
    id: bigint;
    userId: number | null;
    changedBy: number | null;
    action: UserAuditAction;
    changes: object | null;
    reason: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

interface UserAuditLogCreationAttributes extends Optional<UserAuditLogAttributes,
    'id' | 'userId' | 'changedBy' | 'changes' | 'reason' | 'ipAddress' | 'userAgent' | 'createdAt'> { }

class UserAuditLog extends Model<UserAuditLogAttributes, UserAuditLogCreationAttributes> {
    declare id: bigint;
    declare userId: number | null;
    declare changedBy: number | null;
    declare action: UserAuditAction;
    declare changes: object | null;
    declare reason: string | null;
    declare ipAddress: string | null;
    declare userAgent: string | null;
    declare readonly createdAt: Date;
}

UserAuditLog.init(
    {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        changedBy: { type: DataTypes.INTEGER, allowNull: true },
        action: { type: DataTypes.STRING(60), allowNull: false },
        changes: { type: DataTypes.JSONB, allowNull: true },
        reason: { type: DataTypes.STRING(500), allowNull: true },
        ipAddress: { type: DataTypes.STRING(45), allowNull: true },
        userAgent: { type: DataTypes.STRING(500), allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'UserAuditLog',
        tableName: 'user_audit_log',
        timestamps: false,
        underscored: true,
    }
);

export default UserAuditLog;
