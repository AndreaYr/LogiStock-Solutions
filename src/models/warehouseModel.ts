import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Tipos de bodega soportados.
 * - GENERAL: Almacenamiento de todo tipo de productos secos.
 * - REFRIGERADA: Cadena de frío (0–8 °C o congelación).
 * - DELICADOS: Productos frágiles, electrónicos, arte, documentos sensibles.
 * - QUIMICA: Sustancias peligrosas, inflamables o corrosivas (norma NFPA).
 * - EXTERIOR: Patios abiertos para maquinaria, vehículos o carga voluminosa.
 * - VIP: Premium con seguridad reforzada y condiciones controladas.
 */
export type WarehouseType = 'GENERAL' | 'REFRIGERADA' | 'DELICADOS' | 'QUIMICA' | 'EXTERIOR' | 'VIP';

/**
 * Responsable de los servicios públicos (agua, energía, gas, aseo).
 * - ARRENDADOR: El propietario cubre los servicios; están incluidos en el canon.
 * - ARRENDATARIO: El cliente paga directamente los servicios a las empresas.
 * - COMPARTIDO: Se divide según consumo medido o porcentaje acordado.
 */
export type UtilitiesResponsible = 'ARRENDADOR' | 'ARRENDATARIO' | 'COMPARTIDO';

// Interface que define todos los atributos de la tabla Warehouse
export interface IWarehouseAttributes {
    id: number;
    /** Código único de 6 dígitos generado automáticamente al crear la bodega */
    code: string;
    /** Nombre comercial / identificador de la bodega (ej. "LogiStock Norte A-01") */
    name: string;
    /** Descripción detallada: condiciones, restricciones, características especiales */
    description: string;
    /** Tipo de bodega: GENERAL, REFRIGERADA, DELICADOS, QUIMICA, EXTERIOR, VIP */
    warehouseType: WarehouseType;
    /** Ciudad donde se ubica la bodega */
    city: string | null;
    address: string | null;
    postalCode: string | null;
    /** Largo físico del espacio (metros) */
    storageLength: number | null;
    /** Ancho físico del espacio (metros) */
    storageWidth: number | null;
    /** Altura libre interior del espacio (metros) */
    storageHeight: number | null;
    /** Área útil real disponible para almacenamiento (m²) */
    usableArea: number | null;
    /** Porcentaje de capacidad actualmente ocupada */
    capacityOccupied: number;
    /** ¿Los servicios públicos están incluidos en el precio mensual? */
    utilitiesIncluded: boolean;
    /** Quién asume la factura de servicios públicos */
    utilitiesResponsible: UtilitiesResponsible | null;
    /** Servicios cubiertos, ej. "Agua, Energía eléctrica, Aseo" */
    utilitiesDetails: string | null;
    /** ¿Cuenta con sistema de seguridad (CCTV, alarma, guardas)? */
    hasSecuritySystem: boolean;
    /** ¿Tiene muelle de carga/descarga con andén para camiones? */
    hasLoadingDock: boolean;
    /** ¿Hay parqueadero disponible para clientes y operarios? */
    hasParking: boolean;
    /** Horario de acceso, ej. "24/7" o "Lun–Vie 7AM–6PM / Sáb 8AM–1PM" */
    accessHours: string | null;
    /** Indica si la bodega está disponible para arrendar */
    isAvailable: boolean;
    imageUrl: string | null;
    imageUrls?: string[] | null;
    monthlyPrice: number;
}

// Interface para creación (id y campos con default son opcionales)
export interface IWarehouseCreationAttributes extends Optional<
    IWarehouseAttributes,
    | 'id'
    | 'code'
    | 'description'
    | 'warehouseType'
    | 'city'
    | 'storageLength'
    | 'storageWidth'
    | 'storageHeight'
    | 'usableArea'
    | 'postalCode'
    | 'address'
    | 'utilitiesIncluded'
    | 'utilitiesResponsible'
    | 'utilitiesDetails'
    | 'hasSecuritySystem'
    | 'hasLoadingDock'
    | 'hasParking'
    | 'accessHours'
    | 'isAvailable'
    | 'imageUrl'
    | 'monthlyPrice'
    | 'capacityOccupied'
> {}

// Interface Final del Modelo
export interface IWarehouse extends Model<IWarehouseAttributes, IWarehouseCreationAttributes>, IWarehouseAttributes {}

class Warehouse extends Model<IWarehouseAttributes, IWarehouseCreationAttributes> implements IWarehouse {
    declare id: number;
    declare code: string;
    declare name: string;
    declare description: string;
    declare warehouseType: WarehouseType;
    declare city: string | null;
    declare address: string | null;
    declare postalCode: string | null;
    declare storageLength: number | null;
    declare storageWidth: number | null;
    declare storageHeight: number | null;
    declare usableArea: number | null;
    declare capacityOccupied: number;
    declare utilitiesIncluded: boolean;
    declare utilitiesResponsible: UtilitiesResponsible | null;
    declare utilitiesDetails: string | null;
    declare hasSecuritySystem: boolean;
    declare hasLoadingDock: boolean;
    declare hasParking: boolean;
    declare accessHours: string | null;
    declare isAvailable: boolean;
    declare imageUrl: string | null;
    declare imageUrls?: string[] | null;
    declare monthlyPrice: number;
}

Warehouse.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING(6),
        allowNull: false,
        unique: true,
        comment: 'Código único de 6 dígitos generado automáticamente al crear la bodega',
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
    },
    warehouseType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'GENERAL',
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    storageLength: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    storageWidth: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    storageHeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    usableArea: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Área útil real disponible para almacenamiento en m²',
    },
    capacityOccupied: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Porcentaje de capacidad ocupada (0-100)',
    },
    utilitiesIncluded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    utilitiesResponsible: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    utilitiesDetails: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    hasSecuritySystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    hasLoadingDock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    hasParking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    accessHours: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    imageUrl: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Array de URLs de imágenes para carrusel (3-4 imágenes por bodega)',
    },
    monthlyPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize,
    modelName: 'Warehouse',
    tableName: 'warehouses',
    timestamps: false,
    underscored: true,
});

export default Warehouse;
