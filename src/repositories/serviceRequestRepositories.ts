import { BaseRepository } from "./baseRepositories.js";
import { ServiceRequest } from "../models/index.js";
import User from "../models/userModel.js";
import Warehouse from "../models/warehouseModel.js";

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
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findByUser(userId: number, filters: any = {}) {
        try {
            console.log('[findByUser] userId:', userId, 'filters:', filters);
            const result = await ServiceRequest.findAll({
                where: {
                    userId,
                    ...filters
                },
                include: [
                    { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                    { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            console.log('[findByUser] Found:', result.length, 'records');
            return result;
        } catch (err: any) {
            console.error('[findByUser] Error:', err.message, err.stack);
            throw err;
        }
    }

    /** Listar todas las solicitudes (admin/jefe_bodega), opcionalmente filtrar por status */
    async findAll(filters: any = {}) {
        return await ServiceRequest.findAll({
            where: filters,
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
}
