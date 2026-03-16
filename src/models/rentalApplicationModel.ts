import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import {
    IRentalApplication,
    IRentalApplicationAttributes,
    IRentalApplicationCreationAttributes,
    DocumentType,
    ApplicationStatus,
    OfacStatus,
} from '../interfaces/rentalApplicationInterfaces.js';

class RentalApplication
    extends Model<IRentalApplicationAttributes, IRentalApplicationCreationAttributes>
    implements IRentalApplication
{
    declare id: number;
    declare userId: number;
    declare warehouseId: number;
    declare documentType: DocumentType;
    declare documentNumber: string;
    declare phone: string;
    declare address: string;
    declare businessActivity: string;
    declare merchandiseType: string;
    declare commercialRefName: string;
    declare commercialRefPhone: string;
    declare hasDangerousGoods: boolean;
    declare requiresRefrigeration: boolean;
    declare acceptsTerms: boolean;
    declare status: ApplicationStatus;
    declare rejectionReason: string | null;
    declare ofacStatus: OfacStatus;
    declare reviewedBy: number | null;
    declare reviewedAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

RentalApplication.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        warehouseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'warehouses', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        documentType: {
            type: DataTypes.ENUM('CC', 'CE', 'PASAPORTE'),
            allowNull: false,
            comment: 'Tipo de documento del solicitante',
        },
        documentNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Número de documento del solicitante',
        },
        phone: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: 'Teléfono colombiano de 10 dígitos',
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Dirección de residencia del solicitante',
        },
        businessActivity: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Actividad económica o tipo de negocio',
        },
        merchandiseType: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Tipo de mercancía que almacenará en la bodega',
        },
        commercialRefName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            comment: 'Nombre de la referencia comercial',
        },
        commercialRefPhone: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: 'Teléfono de la referencia comercial',
        },
        hasDangerousGoods: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Declara si maneja mercancía peligrosa o inflamable',
        },
        requiresRefrigeration: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Declara si requiere temperatura controlada o refrigeración',
        },
        acceptsTerms: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            comment: 'Acepta los términos y condiciones del arriendo',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'),
            allowNull: false,
            defaultValue: 'PENDING',
            comment: 'Estado actual de la solicitud de arrendamiento',
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            comment: 'Motivo del rechazo ingresado por el admin',
        },
        ofacStatus: {
            type: DataTypes.ENUM('CLEAR', 'FLAGGED', 'ERROR', 'PENDING'),
            allowNull: false,
            defaultValue: 'PENDING',
            comment: 'Resultado de la verificación contra listas OFAC/ONU',
        },
        reviewedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: { model: 'users', key: 'id' },
            comment: 'ID del admin que revisó la solicitud',
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Fecha y hora en que el admin revisó la solicitud',
        },
    },
    {
        sequelize,
        modelName: 'RentalApplication',
        tableName: 'rental_applications',
        timestamps: true,
        underscored: true,
        comment: 'Solicitudes de arrendamiento — fase de estudio previo al contrato',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['warehouse_id'] },
            { fields: ['status'] },
            { fields: ['ofac_status'] },
        ],
    }
);

export default RentalApplication;
