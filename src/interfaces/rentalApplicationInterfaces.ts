import { Model, Optional } from 'sequelize';

export type DocumentType = 'CC' | 'CE' | 'PASAPORTE';
export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type OfacStatus = 'CLEAR' | 'FLAGGED' | 'ERROR' | 'PENDING';
export type RentalDuration = 'MONTHLY' | 'SEMESTER' | 'ANNUAL';

export interface IRentalApplicationAttributes {
    id: number;
    userId: number;
    warehouseId: number;
    documentType: DocumentType;
    documentNumber: string;
    phone: string;
    address: string;
    businessActivity: string;
    merchandiseType: string;
    commercialRefName: string;
    commercialRefPhone: string;
    hasDangerousGoods: boolean;
    requiresRefrigeration: boolean;
    acceptsTerms: boolean;
    rentalDuration: RentalDuration;
    status: ApplicationStatus;
    rejectionReason: string | null;
    ofacStatus: OfacStatus;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRentalApplicationCreationAttributes
    extends Optional<
        IRentalApplicationAttributes,
        'id' | 'rejectionReason' | 'reviewedBy' | 'reviewedAt'
    > {}

export interface IRentalApplication
    extends Model<IRentalApplicationAttributes, IRentalApplicationCreationAttributes>,
        IRentalApplicationAttributes {}
