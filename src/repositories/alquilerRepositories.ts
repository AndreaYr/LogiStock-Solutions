import { BaseRepository } from "./baseRepositories.js";
import Alquiler from "../models/alquilerModel.js";
import { IAlquilerAttributes, IAlquilerCreationAttributes } from "../interfaces/alquilerInterfaces.js";
import Bodega from "../models/bodegaModel.js";

export class AlquilerRepository extends BaseRepository<Alquiler> {
    constructor() {
        super(Alquiler);
    }

    /**
     * Busca los alquileres activos de un usuario, incluyendo la información de la bodega.
     */
    async findActiveByUser(userId: number) {
        return this.model.findAll({
            where: { userId, estado: 'ACTIVO' },
            include: [
                {
                    model: Bodega,
                    as: 'bodega'
                }
            ]
        });
    }
}
