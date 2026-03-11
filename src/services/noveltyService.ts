import { NoveltyRepository } from "../repositories/noveltyRepositories.js";
import { Rental, Warehouse, User } from "../models/index.js";
import { UserRole } from "../interfaces/interfaces.js";
import { NoveltyStatus, NoveltyType } from "../interfaces/noveltyInterfaces.js";

const noveltyRepo = new NoveltyRepository();

export class NoveltyService {
    /**
     * Listar novedades de una bodega con filtros opcionales.
     * Si el usuario es CLIENTE, solo puede ver novedades de bodegas que tiene alquiladas.
     */
    async listNovelties(userId: number, role: UserRole, warehouseId: number, status?: string, type?: string) {
        // 1. Validar que la bodega exista
        const warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
            throw new Error('Bodega no encontrada');
        }

        // 2. Si es cliente, validar que tenga alquilada esta bodega activamente
        if (role === UserRole.CLIENTE) {
            const activeRental = await Rental.findOne({
                where: {
                    userId,
                    warehouseId,
                    status: 'ACTIVE'
                }
            });

            if (!activeRental) {
                throw new Error('No tienes acceso a las novedades de esta bodega.');
            }
        }

        // 3. Preparar filtros
        const filters: any = {};
        if (status) filters.status = status;
        if (type) filters.type = type;

        return await noveltyRepo.findByWarehouse(warehouseId, filters);
    }

    /**
     * Crear una nueva novedad.
     * Solo auxiliar o jefe de bodega (validado por roles en ruta).
     */
    async createNovelty(userId: number, data: { warehouseId: number, type: NoveltyType, product: string, quantity: number, description?: string }) {
        // Validar que la bodega exista
        const warehouse = await Warehouse.findByPk(data.warehouseId);
        if (!warehouse) {
            throw new Error('Bodega no encontrada');
        }

        return await noveltyRepo.create({
            ...data,
            reportedBy: userId,
            status: NoveltyStatus.PENDING,
            description: data.description || null
        });
    }

    /**
     * Actualizar estado de una novedad.
     * Solo admin (validado por roles en ruta).
     */
    async updateStatus(noveltyId: number, status: NoveltyStatus) {
        const novelty = await noveltyRepo.findById(noveltyId);
        if (!novelty) {
            throw new Error('Novedad no encontrada');
        }

        await noveltyRepo.update(noveltyId, { status });

        // Retornar el objeto actualizado
        return await noveltyRepo.findById(noveltyId);
    }
}
