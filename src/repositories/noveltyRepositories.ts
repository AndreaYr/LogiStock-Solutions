import { BaseRepository } from "./baseRepositories.js";
import { Novelty } from "../models/index.js";
import { INoveltyAttributes, INoveltyCreationAttributes } from "../interfaces/noveltyInterfaces.js";

export class NoveltyRepository extends BaseRepository<Novelty> {
    constructor() {
        super(Novelty);
    }

    async findByWarehouse(warehouseId: number, filters: any = {}) {
        return await Novelty.findAll({
            where: {
                warehouseId,
                ...filters
            },
            order: [['createdAt', 'DESC']]
        });
    }
}
