import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import {
    IRentalContract,
    IRentalContractAttributes,
    IRentalContractCreationAttributes,
    ContractStatus,
} from '../interfaces/rentalContractInterfaces.js';

class RentalContract
    extends Model<IRentalContractAttributes, IRentalContractCreationAttributes>
    implements IRentalContract
{
    declare id: number;
    declare applicationId: number;
    declare userId: number;
    declare warehouseId: number;
    declare contractPdfPath: string;
    declare documentPhotoPath: string | null;
    declare clientSignaturePath: string | null;
    declare adminSignaturePath: string | null;
    declare contractHash: string | null;
    declare status: ContractStatus;
    declare clientSignedAt: Date | null;
    declare adminSignedAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

RentalContract.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        applicationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'rental_applications', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'Solicitud de arrendamiento aprobada',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'Cliente dueño del contrato',
        },
        warehouseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'warehouses', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'Bodega arrendada',
        },
        contractPdfPath: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: 'Ruta del PDF del contrato generado',
        },
        documentPhotoPath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
            comment: 'Ruta de la foto de la cédula del cliente',
        },
        clientSignaturePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
            comment: 'Ruta de la imagen de la firma del cliente',
        },
        adminSignaturePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
            comment: 'Ruta de la imagen de la firma del admin',
        },
        contractHash: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: null,
            comment: 'Hash SHA-256 del contrato final sellado',
        },
        status: {
            type: DataTypes.ENUM('PENDING_CLIENT', 'PENDING_ADMIN', 'SIGNED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'PENDING_CLIENT',
            comment: 'Estado del proceso de firma del contrato',
        },
        clientSignedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha en que el cliente firmó el contrato',
        },
        adminSignedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha en que el admin firmó el contrato',
        },
    },
    {
        sequelize,
        modelName: 'RentalContract',
        tableName: 'rental_contracts',
        timestamps: true,
        underscored: true,
        comment: 'Contratos de arrendamiento generados tras aprobar el estudio',
        indexes: [
            { fields: ['application_id'], unique: true },
            { fields: ['user_id'] },
            { fields: ['warehouse_id'] },
            { fields: ['status'] },
        ],
    }
);

export default RentalContract;
