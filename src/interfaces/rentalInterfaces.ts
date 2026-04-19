import { Optional } from "sequelize";

/**
 * Interface for the Rental model attributes
 */
export interface IRentalAttributes {
    id: number;
    userId: number;         // FK -> users.id
    warehouseId: number;    // FK -> warehouses.id
    startDate: Date;
    endDate: Date | null;
    monthlyAmount: number;
    status: 'ACTIVE' | 'FINISHED' | 'PENDING_PAYMENT';
    warehouseCode: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Optional attributes for creation
 */
export interface IRentalCreationAttributes extends Optional<IRentalAttributes, 'id' | 'endDate' | 'status' | 'warehouseCode'> { }
