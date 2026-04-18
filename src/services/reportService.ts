import { Op } from 'sequelize';
import { Movement, ServiceRequest, Warehouse, User, Novelty } from '../models/index.js';
import { ServiceRequestStatus } from '../interfaces/serviceRequestInterfaces.js';

export class ReportService {
    /**
     * Obtener movimientos en un período de tiempo
     */
    async getMovementsByPeriod(warehouseId: number, startDate: string, endDate: string) {
        const movements = await Movement.findAll({
            where: {
                warehouseId,
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    association: 'warehouse',
                    attributes: ['id', 'description']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return {
            period: { startDate, endDate },
            total: movements.length,
            movements
        };
    }

    /**
     * Obtener ocupación (saldo) de una bodega
     */
    async getWarehouseOccupancy(warehouseId: number) {
        const warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
            throw new Error('Bodega no encontrada');
        }

        // Calcular saldo: entradas - salidas
        const entries = await Movement.findAll({
            where: { warehouseId, type: 'ENTRADA' }
        });

        const exits = await Movement.findAll({
            where: { warehouseId, type: 'SALIDA' }
        });

        const totalEntries = entries.reduce((sum, m) => sum + m.quantity, 0);
        const totalExits = exits.reduce((sum, m) => sum + m.quantity, 0);
        const currentOccupancy = totalEntries - totalExits;

        // Usar usableArea, si no existe usar area, si no existe usar 0
        const areaToUse = warehouse.usableArea ?? (warehouse as any).area ?? 0;

        return {
            warehouse: {
                id: warehouse.id,
                name: warehouse.description
            },
            totalEntries,
            totalExits,
            currentOccupancy,
            percentage: areaToUse ? (currentOccupancy / areaToUse) * 100 : 'N/A'
        };
    }

    /**
     * Obtener tracking de una solicitud de cliente (estado actual y historial)
     */
    async getServiceRequestTracking(requestId: number) {
        const request = await ServiceRequest.findByPk(requestId, {
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    association: 'warehouse',
                    attributes: ['id', 'description']
                }
            ]
        });

        if (!request) {
            throw new Error('Solicitud no encontrada');
        }

        // Obtener movimientos asociados a esta solicitud
        const movements = await Movement.findAll({
            where: { serviceRequestId: requestId },
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Obtener novedades asociadas
        const novelties = await Novelty.findAll({
            where: { warehouseId: (request as any).warehouseId },
            order: [['createdAt', 'DESC']]
        });

        return {
            request: {
                id: request.id,
                status: request.status,
                type: request.type,
                product: request.product,
                quantity: request.quantity,
                scheduledDate: (request as any).scheduledDate || 'No programada',
                scheduledTime: (request as any).scheduledTime || undefined,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            },
            client: (request as any).user,
            warehouse: (request as any).warehouse,
            movements,
            novelties
        };
    }

    /**
     * KPIs de bodega: movimientos totales, novedades reportadas, solicitudes, etc.
     */
    async getWarehouseKPIs(warehouseId: number, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const totalMovements = await Movement.count({
            where: {
                warehouseId,
                createdAt: { [Op.gte]: startDate }
            }
        });

        const totalNovelties = await Novelty.count({
            where: {
                warehouseId,
                createdAt: { [Op.gte]: startDate }
            }
        });

        const serviceRequests = await ServiceRequest.count({
            where: {
                warehouseId,
                createdAt: { [Op.gte]: startDate }
            }
        });

        const approvedRequests = await ServiceRequest.count({
            where: {
                warehouseId,
                status: ServiceRequestStatus.APPROVED,
                createdAt: { [Op.gte]: startDate }
            }
        });

        const rejectedRequests = await ServiceRequest.count({
            where: {
                warehouseId,
                status: ServiceRequestStatus.REJECTED,
                createdAt: { [Op.gte]: startDate }
            }
        });

        const occupancy = await this.getWarehouseOccupancy(warehouseId);

        return {
            period: `${days} días`,
            warehouseId: warehouseId,
            metrics: {
                totalMovements,
                totalNovelties,
                totalServiceRequests: serviceRequests,
                approvedRequests,
                rejectedRequests,
                approvalRate: serviceRequests > 0 ? (approvedRequests / serviceRequests * 100).toFixed(2) + '%' : 'N/A',
                currentOccupancy: occupancy
            }
        };
    }

    /**
     * Historial de acciones del jefe de bodega (aprobaciones, rechazos, asignaciones)
     */
    async getManagerActionHistory(warehouseId: number, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Solicitudes aprobadas
        const approved = await ServiceRequest.findAll({
            where: {
                warehouseId,
                status: ServiceRequestStatus.APPROVED,
                updatedAt: { [Op.gte]: startDate }
            },
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Solicitudes rechazadas
        const rejected = await ServiceRequest.findAll({
            where: {
                warehouseId,
                status: ServiceRequestStatus.REJECTED,
                updatedAt: { [Op.gte]: startDate }
            },
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        return {
            period: `${days} días`,
            warehouseId,
            summary: {
                approvalsCount: approved.length,
                rejectionsCount: rejected.length
            },
            actions: {
                approved: approved.map(r => ({
                    id: r.id,
                    clientInfo: (r as any).user,
                    type: r.type,
                    product: r.product,
                    quantity: r.quantity,
                    approvedAt: r.updatedAt
                })),
                rejected: rejected.map(r => ({
                    id: r.id,
                    clientInfo: (r as any).user,
                    type: r.type,
                    product: r.product,
                    quantity: r.quantity,
                    rejectionReason: (r as any).rejectionReason || 'No especificada',
                    rejectedAt: r.updatedAt
                }))
            }
        };
    }
}

export default new ReportService();
