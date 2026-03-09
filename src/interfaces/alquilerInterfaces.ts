import { Optional } from "sequelize";

/**
 * Interface para los atributos del modelo Alquiler
 */
export interface IAlquilerAttributes {
    id: number;
    userId: number;         // FK -> users.id
    bodegaId: number;       // FK -> bodegas.id
    fechaInicio: Date;
    fechaFin: Date | null;
    montoMensual: number;
    estado: 'ACTIVO' | 'FINALIZADO' | 'PENDIENTE_PAGO';
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Atributos opcionales para la creación
 */
export interface IAlquilerCreationAttributes extends Optional<IAlquilerAttributes, 'id' | 'fechaFin' | 'estado'> { }
