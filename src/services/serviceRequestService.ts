import { ServiceRequestRepository } from "../repositories/serviceRequestRepositories.js";
import { Rental, Warehouse, User } from "../models/index.js";
import { UserRole } from "../interfaces/interfaces.js";
import { ServiceRequestType, ServiceRequestStatus } from "../interfaces/serviceRequestInterfaces.js";
import notificationService from './notificationService.js';

const serviceRequestRepo = new ServiceRequestRepository();

export class ServiceRequestService {
    /**
     * Lista todas las solicitudes del cliente autenticado (sin filtro de bodega).
     * Opcional: filtrar por status.
     */
    async listMyRequests(userId: number, status?: string) {
        const filters: any = {};
        if (status) filters.status = status;
        return await serviceRequestRepo.findByUser(userId, filters);
    }

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
     * Listar TODAS las solicitudes del sistema (admin/jefe_bodega).
     * Opcional: filtrar por status.
     */
    async listAllRequests(status?: string) {
        const filters: any = {};
        if (status) filters.status = status;
        console.log('listAllRequests - filters:', filters);
        const requests = await serviceRequestRepo.findAll(filters);
        console.log('listAllRequests - encontradas:', requests.length, 'solicitudes');
        return requests;
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

        // Si es Ingreso o Retiro, producto y cantidad deben estar presentes
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
     * Actualiza el estado de la solicitud (Admin / Jefe de Bodega).
     * Puede incluir: rejectionReason, assignedAuxiliaryId.
     * Envía notificaciones al cliente, auxiliar (si aplica), admin y otros jefe_bodega.
     */
    async updateStatus(requestId: number, status: ServiceRequestStatus, rejectionReason?: string, assignedAuxiliaryId?: number, updatedByUserId?: number) {
        const request = await serviceRequestRepo.findById(requestId);
        if (!request) {
            throw new Error('Solicitud no encontrada');
        }

        const updateData: any = { status };
        if (status === ServiceRequestStatus.REJECTED && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        if (assignedAuxiliaryId) {
            updateData.assignedAuxiliaryId = assignedAuxiliaryId;
        }

        await serviceRequestRepo.update(requestId, updateData);
        const updated = await serviceRequestRepo.findById(requestId);

        // Información de la solicitud para las notificaciones
        const warehouseName = (request as any).warehouse?.name
            ?? (request as any).warehouse?.description
            ?? `Bodega #${request.warehouseId}`;
        const typeLabel = request.type === ServiceRequestType.INBOUND ? 'Ingreso'
            : request.type === ServiceRequestType.OUTBOUND ? 'Retiro'
            : 'Cancelación';
        const productInfo = request.product ? ` de "${request.product}"` : '';

        console.log(`[ServiceRequestService] Actualizando solicitud #${requestId} a estado: ${status}`);

        // 1. NOTIFICAR AL CLIENTE (siempre)
        console.log(`[ServiceRequestService] Notificando al CLIENTE (userId=${request.userId})`);
        try {
            if (status === ServiceRequestStatus.APPROVED) {
                await notificationService.create(
                    request.userId,
                    'system',
                    `✅ Solicitud de ${typeLabel} aprobada`,
                    `Tu solicitud de ${typeLabel}${productInfo} en ${warehouseName} fue aprobada por el jefe de bodega.`
                );
            } else if (status === ServiceRequestStatus.REJECTED) {
                const reasonText = rejectionReason ? `\n\nMotivo: ${rejectionReason}` : '';
                await notificationService.create(
                    request.userId,
                    'system',
                    `❌ Solicitud de ${typeLabel} rechazada`,
                    `Tu solicitud de ${typeLabel}${productInfo} en ${warehouseName} fue rechazada.${reasonText}`
                );
            } else if (status === ServiceRequestStatus.COMPLETED) {
                await notificationService.create(
                    request.userId,
                    'system',
                    `✓ Solicitud de ${typeLabel} completada`,
                    `Tu solicitud de ${typeLabel}${productInfo} en ${warehouseName} ha sido completada exitosamente.`
                );
            }
        } catch (err) {
            console.error(`[ServiceRequestService] Error notificando al cliente:`, err);
        }

        // 2. NOTIFICAR AL AUXILIAR ASIGNADO (si existe y es APPROVED o COMPLETED)
        if ((assignedAuxiliaryId || (updated as any).assignedAuxiliaryId) && (status === ServiceRequestStatus.APPROVED || status === ServiceRequestStatus.COMPLETED)) {
            const auxiliaryId = assignedAuxiliaryId || (updated as any).assignedAuxiliaryId;
            console.log(`[ServiceRequestService] Notificando al AUXILIAR (userId=${auxiliaryId})`);
            try {
                await notificationService.create(
                    auxiliaryId,
                    'system',
                    `📋 Nueva orden asignada - ${typeLabel}`,
                    `Te ha sido asignada una orden de ${typeLabel}${productInfo} en ${warehouseName}. Cliente: ${(request as any).user?.firstName || 'Usuario'}`
                );
            } catch (err) {
                console.error(`[ServiceRequestService] Error notificando al auxiliar:`, err);
            }
        }

        // 3. NOTIFICAR A OTROS STAFF (admin, otros jefe_bodega, pero NO al que hizo la actualización)
        console.log(`[ServiceRequestService] Notificando a otros STAFF (actualizado por userId=${updatedByUserId})`);
        try {
            const staffUsers = await User.findAll({
                include: [{
                    association: 'role',
                    where: {}
                }]
            });

            for (const staff of staffUsers) {
                const staffRole = (staff as any).role?.name?.toLowerCase() ?? '';
                const isStaff = staffRole.includes('admin') || staffRole.includes('jefe');
                const isNotClient = staff.id !== request.userId;
                const isNotUpdater = staff.id !== updatedByUserId;

                if (isStaff && isNotClient && isNotUpdater) {
                    console.log(`[ServiceRequestService] → Notificando a ${staffRole} (userId=${staff.id})`);
                    await notificationService.create(
                        staff.id,
                        'system',
                        `📊 Solicitud ${status === ServiceRequestStatus.APPROVED ? 'aprobada' : status === ServiceRequestStatus.REJECTED ? 'rechazada' : 'actualizada'}`,
                        `Solicitud de ${typeLabel}${productInfo} en ${warehouseName} - Estado: ${status}`
                    );
                }
            }
        } catch (err) {
            console.error(`[ServiceRequestService] Error notificando a staff:`, err);
        }

        return updated;
    }

    /**
     * Asignar un auxiliar a una orden aprobada.
     */
    async assignAuxiliary(requestId: number, auxiliaryId: number) {
        const request = await serviceRequestRepo.findById(requestId);
        if (!request) {
            throw new Error('Solicitud no encontrada');
        }

        if (request.status !== ServiceRequestStatus.APPROVED) {
            throw new Error('Solo se pueden asignar órdenes aprobadas');
        }

        const auxiliary = await User.findByPk(auxiliaryId);
        if (!auxiliary) {
            throw new Error('Auxiliar no encontrado');
        }

        await serviceRequestRepo.update(requestId, { assignedAuxiliaryId: auxiliaryId });
        
        // Notificar al auxiliar que fue asignado a una orden
        const typeLabel = request.type === ServiceRequestType.INBOUND ? 'Ingreso'
            : request.type === ServiceRequestType.OUTBOUND ? 'Retiro'
            : 'Cancelación';

        await notificationService.create(
            auxiliaryId,
            'system',
            `Nueva orden asignada: ${typeLabel}`,
            `Has sido asignado a una orden de ${typeLabel}${request.product ? ` de "${request.product}"` : ''} en la bodega.`
        ).catch(console.error);

        return await serviceRequestRepo.findById(requestId);
    }
}
