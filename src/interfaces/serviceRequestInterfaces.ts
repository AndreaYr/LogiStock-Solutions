import { Model, Optional } from "sequelize";

export enum ServiceRequestType {
    INBOUND = 'INBOUND',        // Ingreso de productos
    OUTBOUND = 'OUTBOUND',      // Retiro de productos
    CANCELLATION = 'CANCELLATION' // Cancelación del alquiler
}

export enum ServiceRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED'
}

export interface IServiceRequestAttributes {
    id: number;
    warehouseId: number;
    userId: number;       // El cliente que hace la solicitud
    type: ServiceRequestType;
    product: string | null;     // Aplicable para INBOUND / OUTBOUND
    quantity: number | null;    // Aplicable para INBOUND / OUTBOUND
    description: string | null;
    status: ServiceRequestStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IServiceRequestCreationAttributes extends Optional<IServiceRequestAttributes, 'id' | 'status' | 'product' | 'quantity' | 'description' | 'createdAt' | 'updatedAt'> { }

export interface IServiceRequest extends Model<IServiceRequestAttributes, IServiceRequestCreationAttributes>, IServiceRequestAttributes { }
