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
    COMPLETED = 'COMPLETED',
    NEEDS_REVISION = 'NEEDS_REVISION',
    APPROVED_BY_JEFE = 'APPROVED_BY_JEFE'
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
    scheduledDate?: string | null;  // Fecha agendada por el cliente (YYYY-MM-DD)
    scheduledTime?: string | null;  // Hora agendada (HH:mm)
    rejectionReason?: string | null;  // Razón de rechazo si status = REJECTED
    assignedAuxiliaryId?: number | null;  // FK a user (rol AUXILIARY)
    completedByAuxiliaryId?: number | null;  // Auxiliar que completó
    completedByAuxiliaryName?: string | null;  // Nombre del auxiliar que completó
    completedAt?: Date | null;  // Fecha de completación
    auxiliaryReport?: any;  // Reporte del auxiliar
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IServiceRequestCreationAttributes extends Optional<IServiceRequestAttributes, 'id' | 'status' | 'product' | 'quantity' | 'description' | 'scheduledDate' | 'scheduledTime' | 'rejectionReason' | 'assignedAuxiliaryId' | 'completedByAuxiliaryId' | 'completedByAuxiliaryName' | 'completedAt' | 'auxiliaryReport' | 'createdAt' | 'updatedAt'> { }

export interface IServiceRequest extends Model<IServiceRequestAttributes, IServiceRequestCreationAttributes>, IServiceRequestAttributes { }
