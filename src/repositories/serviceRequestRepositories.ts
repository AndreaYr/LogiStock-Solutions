import { BaseRepository } from "./baseRepositories.js";
import { ServiceRequest } from "../models/index.js";

export class ServiceRequestRepository extends BaseRepository<ServiceRequest> {
    constructor() {
        super(ServiceRequest);
    }

    async findByWarehouse(warehouseId: number, filters: any = {}) {
        return await ServiceRequest.findAll({
            where: {
                warehouseId,
                ...filters
            },
            order: [['createdAt', 'DESC']]
        });
    }

    async findByUser(userId: number, filters: any = {}) {
        return await ServiceRequest.findAll({
            where: {
                userId,
                ...filters
            },
            order: [['createdAt', 'DESC']]
        });
    }
}
