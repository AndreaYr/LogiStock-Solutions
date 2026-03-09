import { BaseRepository } from './baseRepositories.js';
import Movement from '../models/movementModel.js';

export class MovementRepository extends BaseRepository<Movement> {
    constructor() {
        super(Movement);
    }

    /** Obtiene los movimientos de una bodega específica */
    async findByWarehouse(warehouseId: number) {
        return this.model.findAll({
            where: { warehouseId },
            order: [['createdAt', 'DESC']],
        });
    }

    /** Obtiene los movimientos registrados por un usuario específico */
    async findByUser(userId: number) {
        return this.model.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
    }
}

export default new MovementRepository();
