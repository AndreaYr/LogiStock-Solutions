import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type ServiceRequestAuditAction =
    | 'CREATE' | 'APPROVE' | 'REJECT'
    | 'ASSIGN_AUXILIARY' | 'SUBMIT_REPORT'
    | 'REVIEW_APPROVE' | 'COMPLETE' | 'STATUS_CHANGE';

interface ServiceRequestAuditLogAttributes {
    id: bigint;
    requestId: number | null;
    changedBy: number | null;
    action: ServiceRequestAuditAction;
    previousStatus: string | null;
    newStatus: string | null;
    reason: string | null;
    metadata: object | null;
    createdAt: Date;
}

interface ServiceRequestAuditLogCreationAttributes extends Optional<ServiceRequestAuditLogAttributes,
    'id' | 'requestId' | 'changedBy' | 'previousStatus' | 'newStatus' | 'reason' | 'metadata' | 'createdAt'> { }

class ServiceRequestAuditLog extends Model<ServiceRequestAuditLogAttributes, ServiceRequestAuditLogCreationAttributes> {
    declare id: bigint;
    declare requestId: number | null;
    declare changedBy: number | null;
    declare action: ServiceRequestAuditAction;
    declare previousStatus: string | null;
    declare newStatus: string | null;
    declare reason: string | null;
    declare metadata: object | null;
    declare readonly createdAt: Date;
}

ServiceRequestAuditLog.init(
    {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        requestId: { type: DataTypes.INTEGER, allowNull: true },
        changedBy: { type: DataTypes.INTEGER, allowNull: true },
        action: { type: DataTypes.STRING(60), allowNull: false },
        previousStatus: { type: DataTypes.STRING(50), allowNull: true },
        newStatus: { type: DataTypes.STRING(50), allowNull: true },
        reason: { type: DataTypes.STRING(500), allowNull: true },
        metadata: { type: DataTypes.JSONB, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'ServiceRequestAuditLog',
        tableName: 'service_request_audit_log',
        timestamps: false,
        underscored: true,
    }
);

export default ServiceRequestAuditLog;
