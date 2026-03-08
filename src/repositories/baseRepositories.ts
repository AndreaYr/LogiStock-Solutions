/**
 * Repositorio genérico que provee operaciones CRUD para cualquier modelo sequelize.
 * 
 * ¿Por qué genérico?
 * En vez de repetir findAll, findById, create, etc. en cada repositorio,
 * lo definimos una sola vez aquí. Cada repositorio específico extiende esta
 * clase y hereda todos estos métodos automáticamente.
 */

import { Model, ModelStatic, FindOptions, CreationAttributes, Attributes, WhereOptions } from "sequelize";

export class BaseRepository<M extends Model> {
    constructor(protected readonly model: ModelStatic<M>) {}

    // Obtiene todos los registros de la tabla
    async findAll(options?: FindOptions<Attributes<M>>): Promise<M[]> {
        return this.model.findAll(options);
    }

    /**
     * Busca un registro por su ID. 
     * @param id El ID del registro a buscar.
     * @param options Opciones adicionales
     */
    async findById(id: number, options?: Omit<FindOptions<Attributes<M>>, 'where'>): Promise<M | null> {
        return this.model.findByPk(id, options);
    }

    /**
     * Busca el primer registro que coincida con las condiciones dadas.
     * @param  options Opciones de búsqueda, incluyendo condiciones 'where'.
     */

    async findOne(options: FindOptions<Attributes<M>>): Promise<M | null> {
        return this.model.findOne(options);
    }

    /**
     * Crea un nuevo registro en la tabla
     * @param data Los datos para crear el nuevo registro.
     */

    async create(data: CreationAttributes<M>): Promise<M> {
        return this.model.create(data);
    }
    
    /**
     * Actualiza registros por su id
     * @param id El ID del registro a actualizar.
     * @param data Los datos a actualizar.
     */
    async update(
        id: number,
        data: Partial<Attributes<M>>
    ): Promise<[affectedCount: number]> {
        return this.model.update(data as any, {
            where: { id } as unknown as WhereOptions<Attributes<M>>,
        });
    }

    /**
     * Elimina un registro por su ID.
     * @param id El ID del registro a eliminar.
     */
    async delete(id: number): Promise<number> {
        return this.model.destroy({
            where: { id } as unknown as WhereOptions<Attributes<M>>,
        });
    }
    
}