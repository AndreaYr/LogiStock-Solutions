import { Model, Optional } from 'sequelize';

export type ContractStatus =
    | 'PENDING_CLIENT'  // Generado, esperando firma del cliente
    | 'PENDING_ADMIN'   // Cliente firmó, esperando firma del admin
    | 'SIGNED'          // Ambas partes firmaron, contrato vigente
    | 'CANCELLED';      // Contrato cancelado

export interface IRentalContractAttributes {
    id: number;
    applicationId: number;
    userId: number;
    warehouseId: number;
    contractPdfPath: string;
    documentPhotoPath: string | null;
    clientSignaturePath: string | null;
    adminSignaturePath: string | null;
    contractHash: string | null;
    status: ContractStatus;
    clientSignedAt: Date | null;
    adminSignedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRentalContractCreationAttributes
    extends Optional<
        IRentalContractAttributes,
        | 'id'
        | 'documentPhotoPath'
        | 'clientSignaturePath'
        | 'adminSignaturePath'
        | 'contractHash'
        | 'clientSignedAt'
        | 'adminSignedAt'
    > {}

export interface IRentalContract
    extends Model<IRentalContractAttributes, IRentalContractCreationAttributes>,
        IRentalContractAttributes {}
