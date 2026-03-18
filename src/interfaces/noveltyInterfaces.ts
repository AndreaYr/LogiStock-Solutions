import { Model, Optional } from "sequelize";

export enum NoveltyType {
    DAMAGE = 'DAMAGE',
    MISSING = 'MISSING',
    EXPIRED = 'EXPIRED',
    EXCESS = 'EXCESS',
    OTHER = 'OTHER'
}

export enum NoveltyStatus {
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
    RESOLVED = 'RESOLVED'
}

export interface INoveltyAttributes {
    id: number;
    warehouseId: number;
    reportedBy: number;
    type: NoveltyType;
    product: string;
    quantity: number;
    description: string | null;
    photos?: any[] | null;  // Array de fotos (URL o ruta local)
    status: NoveltyStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INoveltyCreationAttributes extends Optional<INoveltyAttributes, 'id' | 'status' | 'description' | 'photos' | 'createdAt' | 'updatedAt'> { }

export interface INovelty extends Model<INoveltyAttributes, INoveltyCreationAttributes>, INoveltyAttributes { }
