import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export type ReportType =
    | 'MOVEMENTS_PERIOD'
    | 'WAREHOUSE_OCCUPANCY'
    | 'SERVICE_REQUEST_TRACKING'
    | 'WAREHOUSE_KPIS'
    | 'MANAGER_ACTIONS';

interface ReportAccessLogAttributes {
    id: bigint;
    userId: number | null;
    reportType: ReportType;
    params: object | null;
    ipAddress: string | null;
    createdAt: Date;
}

interface ReportAccessLogCreationAttributes extends Optional<ReportAccessLogAttributes,
    'id' | 'userId' | 'params' | 'ipAddress' | 'createdAt'> { }

class ReportAccessLog extends Model<ReportAccessLogAttributes, ReportAccessLogCreationAttributes> {
    declare id: bigint;
    declare userId: number | null;
    declare reportType: ReportType;
    declare params: object | null;
    declare ipAddress: string | null;
    declare readonly createdAt: Date;
}

ReportAccessLog.init(
    {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        reportType: { type: DataTypes.STRING(100), allowNull: false },
        params: { type: DataTypes.JSONB, allowNull: true },
        ipAddress: { type: DataTypes.STRING(45), allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'ReportAccessLog',
        tableName: 'report_access_log',
        timestamps: false,
        underscored: true,
    }
);

export default ReportAccessLog;
