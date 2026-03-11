import { ServiceRequestRepository } from "../repositories/serviceRequestRepositories.js";
import { Rental, Warehouse } from "../models/index.js";
import { UserRole } from "../interfaces/interfaces.js";
import { ServiceRequestType, ServiceRequestStatus } from "../interfaces/serviceRequestInterfaces.js";

const serviceRequestRepo = new ServiceRequestRepository();

export class ServiceRequestService {
    /**
     * Listar solicitudes de una bodega.
     * Si el usuario es CLIENTE, solo ve sus propias solicitudes o las de sus bodegas alquiladas activamente.
     */
    async listRequests(userId: number, role: UserRole, warehouseId: number, status?: string) {
        const warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
            throw new Error('Bodega no encontrada');
        }

        if (role === UserRole.CLIENTE) {
            // El cliente solo puede ver solicitudes si tiene la bodega alquilada
            const activeRental = await Rental.findOne({
                where: { userId, warehouseId, status: 'ACTIVE' }
            });
            if (!activeRental) {
                throw new Error('No tienes acceso a las solicitudes de esta bodega.');
            }
        }

        const filters: any = {};
        if (status) filters.status = status;
        
        // Si es cliente, mejor filtramos también por su userId para ser doblemente seguros
        if (role === UserRole.CLIENTE) {
            filters.userId = userId;
        }

        return await serviceRequestRepo.findByWarehouse(warehouseId, filters);
    }

    /**
     * Cliente crea una nueva solicitud (Ingreso, Retiro, Cancelación).
     */
    async createRequest(userId: number, data: { warehouseId: number, type: ServiceRequestType, product?: string, quantity?: number, description?: string }) {
        const warehouse = await Warehouse.findByPk(data.warehouseId);
        if (!warehouse) {
            throw new Error('Bodega no encontrada');
        }

        // Solo clientes con alquileres activos pueden solicitar algo en esa bodega
        const activeRental = await Rental.findOne({
            where: { userId, warehouseId: data.warehouseId, status: 'ACTIVE' }
        });

        if (!activeRental) {
            throw new Error('Solo puedes crear solicitudes para bodegas que tienes alquiladas activamente.');
        }

        // Si es Ingreso o Retiro, producto y cantidad deberían estar ahí (aunque son opcionales en BD, podemos obligarlos si es necesario)
        if (data.type !== ServiceRequestType.CANCELLATION) {
            if (!data.product || data.quantity == null) {
                throw new Error('Debes proveer un producto y cantidad para solicitudes de Ingreso o Retiro.');
            }
        }

        return await serviceRequestRepo.create({
            warehouseId: data.warehouseId,
            userId,
            type: data.type,
            product: data.product || null,
            quantity: data.quantity || null,
            description: data.description || null,
            status: ServiceRequestStatus.PENDING
        });
    }

    /**
     * Actualiza el estado de la solicitud (Admin / Staff).
     */
    async updateStatus(requestId: number, status: ServiceRequestStatus) {
        const request = await serviceRequestRepo.findById(requestId);
        if (!request) {
            throw new Error('Solicitud no encontrada');
        }

        await serviceRequestRepo.update(requestId, { status });
        
        return await serviceRequestRepo.findById(requestId);
    }
}
