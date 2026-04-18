import { Op } from "sequelize";
import { ServiceRequestRepository } from "../repositories/serviceRequestRepositories.js";
import { MovementRepository } from "../repositories/movementRepositories.js";
import { Rental, Warehouse, User } from "../models/index.js";
import { UserRole } from "../interfaces/interfaces.js";
import { ServiceRequestType, ServiceRequestStatus } from "../interfaces/serviceRequestInterfaces.js";
import notificationService from './notificationService.js';

const MAX_REQUESTS_PER_DAY = 3;

const serviceRequestRepo = new ServiceRequestRepository();
const movementRepo = new MovementRepository();

export class ServiceRequestService {
    /**
     * Lista todas las solicitudes del cliente autenticado (sin filtro de bodega).
     * Opcional: filtrar por status.
     */
    async listMyRequests(userId: number, status?: string) {
        try {
            console.log('[listMyRequests] userId:', userId, 'status:', status);
            const filters: any = {};
            if (status) filters.status = status;
            const requests = await serviceRequestRepo.findByUser(userId, filters);
            console.log('[listMyRequests] Found requests:', requests.length);
            return requests;
        } catch (err: any) {
            console.error('[listMyRequests] Error:', err.message, err.stack);
            throw err;
        }
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
        // Soportar múltiples estados separados por coma: "APPROVED,COMPLETED"
        if (status) {
            const statusList = status.split(',').map(s => s.trim());
            if (statusList.length > 1) {
                filters.status = { [Op.in]: statusList };
            } else {
                filters.status = status;
            }
        }
        console.log('listAllRequests - filters:', filters);
        const requests = await serviceRequestRepo.findAll(filters);
        console.log('listAllRequests - encontradas:', requests.length, 'solicitudes');
        return requests;
    }

    /**
     * Devuelve la disponibilidad de días en un mes dado.
     * Retorna el conteo de solicitudes PENDING/APPROVED por fecha y el máximo permitido.
     */
    async getAvailability(year: number, month: number) {
        const monthStr = String(month).padStart(2, '0');
        const requests = await serviceRequestRepo.findAll({
            scheduledDate: { [Op.like]: `${year}-${monthStr}-%` },
            status: { [Op.in]: [ServiceRequestStatus.PENDING, ServiceRequestStatus.APPROVED] },
        } as any);

        const counts: Record<string, number> = {};
        (requests as any[]).forEach((r) => {
            if (r.scheduledDate) {
                counts[r.scheduledDate] = (counts[r.scheduledDate] || 0) + 1;
            }
        });

        return { counts, maxPerDay: MAX_REQUESTS_PER_DAY };
    }

    /**
     * Cliente crea una nueva solicitud (Ingreso, Retiro, Cancelación).
     */
    async createRequest(userId: number, data: { warehouseId: number, type: ServiceRequestType, product?: string, quantity?: number, description?: string, scheduledDate?: string, scheduledTime?: string }) {
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

            // Validar fecha para INBOUND/OUTBOUND
            if (!data.scheduledDate) {
                throw new Error('Debes seleccionar una fecha para la solicitud.');
            }
            const today = new Date().toISOString().split('T')[0];
            if (data.scheduledDate <= today) {
                throw new Error('No puedes agendar una solicitud para el día de hoy o días pasados. Selecciona una fecha futura.');
            }

            // Validar disponibilidad del día
            const existing = await serviceRequestRepo.findAll({
                scheduledDate: data.scheduledDate,
                status: { [Op.in]: [ServiceRequestStatus.PENDING, ServiceRequestStatus.APPROVED] },
            } as any);
            if ((existing as any[]).length >= MAX_REQUESTS_PER_DAY) {
                throw new Error(`No hay disponibilidad para el día seleccionado. Máximo ${MAX_REQUESTS_PER_DAY} solicitudes por día.`);
            }
        }

        // Crear la solicitud
        const newRequest = await serviceRequestRepo.create({
            warehouseId: data.warehouseId,
            userId,
            type: data.type,
            product: data.product || null,
            quantity: data.quantity || null,
            description: data.description || null,
            status: ServiceRequestStatus.PENDING,
            scheduledDate: data.scheduledDate || null,
            scheduledTime: data.scheduledTime || null,
        });

        // Notificar a los jefes de bodega sobre la nueva solicitud
        try {
            const client = await User.findByPk(userId);
            const clientName = client 
                ? `${client.firstName} ${client.lastName}` 
                : `Cliente #${userId}`;
            
            const warehouseName = warehouse.name || warehouse.description || `Bodega #${data.warehouseId}`;

            console.log(`[ServiceRequestService] 📬 Notificando nueva solicitud a jefes de bodega...`);
            await notificationService.notifyNewServiceRequest(
                clientName,
                warehouseName,
                data.type,
                data.product || null,
                data.quantity || null
            );
        } catch (err) {
            console.error(`[ServiceRequestService] Error notificando nueva solicitud:`, err);
            // No bloquear la respuesta si falla la notificación
        }

        return newRequest;
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
     * Obtener una solicitud específica por ID.
     */
    async getRequestById(requestId: number) {
        const request = await serviceRequestRepo.findById(requestId, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
            ]
        });
        if (!request) {
            throw new Error('Solicitud no encontrada');
        }
        return request;
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

    /**
     * Auxiliar envía reporte de completación de orden.
     * Guarda el reporte en auxiliaryReport (JSON) y marca la orden con el auxiliar que la completó.
     */
    async submitReport(requestId: number, auxiliaryId: number, reportData: any) {
        const request = await serviceRequestRepo.findById(requestId);
        if (!request) {
            throw new Error('Solicitud no encontrada');
        }

        if (request.status !== ServiceRequestStatus.APPROVED) {
            throw new Error('Solo se puede enviar reporte de órdenes aprobadas');
        }

        const auxiliary = await User.findByPk(auxiliaryId);
        if (!auxiliary) {
            throw new Error('Auxiliar no encontrado');
        }

        // Actualizar con el reporte, información del auxiliar y cambiar estado a COMPLETED
        const updateData: any = {
            status: ServiceRequestStatus.COMPLETED,
            auxiliaryReport: reportData,
            assignedAuxiliaryId: auxiliaryId,
            completedByAuxiliaryId: auxiliaryId,
            completedByAuxiliaryName: `${auxiliary.firstName} ${auxiliary.lastName}`,
            completedAt: new Date(),
        };

        await serviceRequestRepo.update(requestId, updateData);
        const updated = await serviceRequestRepo.findById(requestId, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
            ]
        });

        console.log(`[ServiceRequestService] Reporte enviado por auxiliar (userId=${auxiliaryId}) para orden #${requestId}. Estado cambiado a COMPLETED`);

        // Notificar al Jefe de Bodega que hay un reporte para revisar
        try {
            const typeLabel = updated?.type === 'INBOUND' ? 'Entrada' : updated?.type === 'OUTBOUND' ? 'Salida' : updated?.type || 'Solicitud';
            const warehouseName = (updated as any)?.warehouse?.name || 'Bodega desconocida';
            const productInfo = updated?.product ? ` de ${updated.product}` : '';
            
            // Buscar jefes de bodega para notificar
            const bosses = await User.findAll({
                where: { role: 'jefe_bodega' } as any
            });
            
            for (const boss of bosses) {
                await notificationService.create(
                    boss.id,
                    'system',
                    `📋 Reporte listo para revisar - ${typeLabel}`,
                    `El auxiliar ${auxiliary.firstName} ${auxiliary.lastName} completó la orden de ${typeLabel}${productInfo} en ${warehouseName}. Por favor, revisa y valida.`
                );
            }
        } catch (err) {
            console.error(`[ServiceRequestService] Error notificando a jefes:`, err);
        }

        return updated;
    }

    /**
     * Jefe de bodega revisa y aprueba el reporte del auxiliar.
     * La orden ya estará en COMPLETED cuando el auxiliar envía el reporte.
     * El Jefe solo revisa, valida y crea el Movement automáticamente.
     */
    async reviewAndApproveReport(requestId: number, jefeId: number, approvalNotes?: string) {
        const request = await serviceRequestRepo.findById(requestId, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
            ]
        });
        if (!request) {
            throw new Error('Solicitud no encontrada');
        }

        if (request.status !== ServiceRequestStatus.COMPLETED || !request.auxiliaryReport) {
            throw new Error('Solo se pueden revisar órdenes que ya tienen reporte del auxiliar');
        }

        const jefe = await User.findByPk(jefeId);
        if (!jefe) {
            throw new Error('Jefe de bodega no encontrado');
        }

        // Marcar como APPROVED_BY_JEFE (orden completada y aprobada por el jefe)
        const updateData: any = {
            status: ServiceRequestStatus.APPROVED_BY_JEFE,
        };
        if (approvalNotes) {
            updateData.auxiliaryReport = {
                ...request.auxiliaryReport,
                approvalNotes,
                approvedAt: new Date(),
                approvedByJefe: `${jefe.firstName} ${jefe.lastName}`,
            };
        }

        await serviceRequestRepo.update(requestId, updateData);
        const completed = await serviceRequestRepo.findById(requestId, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'description'] }
            ]
        });

        // Crear Movement basado en el reporte del auxiliar
        try {
            const movementType = request.type === ServiceRequestType.INBOUND ? 'ENTRADA' : 'SALIDA';
            
            // Calcular cantidad procesada del reporte
            const report = request.auxiliaryReport;
            const quantityProcessed = report.quantityProcessed || request.quantity || 0;
            
            // Observaciones del auxiliar + notas de aprobación del jefe
            const observations = [
                report.observations ? `Auxiliar: ${report.observations}` : '',
                approvalNotes ? `Jefe: ${approvalNotes}` : ''
            ].filter(o => o).join('\n');

            const warehouseName = (completed as any)?.warehouse?.name || 'Bodega desconocida';

            await movementRepo.create({
                warehouseId: request.warehouseId,
                userId: request.completedByAuxiliaryId || request.userId,
                type: movementType,
                product: request.product || 'Producto',
                quantity: quantityProcessed,
                description: null,
                serviceRequestId: requestId,
                photos: report.photos || [],
                observations: observations || null,
            });

            console.log(`[ServiceRequestService] Movement creado para orden #${requestId}`);
        } catch (err) {
            console.error(`[ServiceRequestService] Error creando Movement:`, err);
            // No lanzar error, solo registrar
        }

        // Información para notificaciones
        const warehouseName = (request as any).warehouse?.name
            ?? (request as any).warehouse?.description
            ?? `Bodega #${request.warehouseId}`;
        const typeLabel = request.type === ServiceRequestType.INBOUND ? 'Entrada'
            : request.type === ServiceRequestType.OUTBOUND ? 'Salida'
            : 'Cancelación';
        const productInfo = request.product ? ` de "${request.product}"` : '';

        // Notificar al cliente
        console.log(`[ServiceRequestService] Notificando al CLIENTE (userId=${request.userId})`);
        try {
            await notificationService.create(
                request.userId,
                'system',
                `✓ Solicitud de ${typeLabel} completada`,
                `Tu solicitud de ${typeLabel}${productInfo} en ${warehouseName} ha sido completada exitosamente por ${request.completedByAuxiliaryName}.`
            );
        } catch (err) {
            console.error(`[ServiceRequestService] Error notificando al cliente:`, err);
        }

        // Notificar al auxiliar que su reporte fue aprobado
        if (request.completedByAuxiliaryId) {
            console.log(`[ServiceRequestService] Notificando al AUXILIAR (userId=${request.completedByAuxiliaryId})`);
            try {
                await notificationService.create(
                    request.completedByAuxiliaryId,
                    'system',
                    `✓ Tu reporte fue aprobado`,
                    `El reporte de tu orden de ${typeLabel}${productInfo} en ${warehouseName} ha sido revisado y aprobado por el jefe de bodega.`
                );
            } catch (err) {
                console.error(`[ServiceRequestService] Error notificando al auxiliar:`, err);
            }
        }

        console.log(`[ServiceRequestService] Orden #${requestId} marcada como COMPLETED por jefe (userId=${jefeId})`);

        return completed;
    }
}
