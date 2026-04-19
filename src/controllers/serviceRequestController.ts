import { Request, Response } from 'express';
import { ServiceRequestService } from '../services/serviceRequestService.js';
import { ServiceRequestStatus, ServiceRequestType } from '../interfaces/serviceRequestInterfaces.js';
import auditService from '../services/auditService.js';
import { serviceRequestsTotal } from '../config/metrics.js';

const serviceRequestService = new ServiceRequestService();

export class ServiceRequestController {
    /** GET /api/service-requests/all — todas las solicitudes del sistema (admin/jefe_bodega) */
    static async getAllRequests(req: Request, res: Response): Promise<void> {
        try {
            const status = req.query.status as string | undefined;
            const requests = await serviceRequestService.listAllRequests(status);
            res.status(200).json(requests);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    /** GET /api/service-requests/me — todas las solicitudes del cliente autenticado */
    static async getMine(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                console.log('[getMine] ERROR: req.user es undefined. Headers:', req.headers);
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }
            const userId = req.user.userId;
            const status = req.query.status as string | undefined;
            const requests = await serviceRequestService.listMyRequests(userId, status);
            res.status(200).json(requests);
        } catch (err: any) {
            console.error('[getMine] Error:', err.message, err.stack);
            res.status(500).json({ message: err.message });
        }
    }

    /** GET /api/service-requests?warehouseId={id} */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const role = req.user!.role;
            const warehouseId = Number(req.query.warehouseId);
            const status = req.query.status as string;

            if (!warehouseId) {
                res.status(400).json({ message: 'warehouseId es requerido' });
                return;
            }

            const requests = await serviceRequestService.listRequests(userId, role, warehouseId, status);
            res.status(200).json(requests);
        } catch (err: any) {
            res.status(403).json({ message: err.message });
        }
    }

    /** GET /api/service-requests/availability?year=YYYY&month=MM */
    static async getAvailability(req: Request, res: Response): Promise<void> {
        try {
            const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
            const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
            const result = await serviceRequestService.getAvailability(year, month);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    /** POST /api/service-requests */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { warehouseId, type, product, quantity, description, scheduledDate, scheduledTime } = req.body;

            if (!warehouseId || !type || !Object.values(ServiceRequestType).includes(type)) {
                res.status(400).json({ message: 'Datos incompletos o tipo inválido' });
                return;
            }

            const newRequest = await serviceRequestService.createRequest(userId, {
                warehouseId,
                type,
                product,
                quantity,
                description,
                scheduledDate,
                scheduledTime,
            });
            auditService.logServiceRequest({ requestId: (newRequest as any).id, changedBy: userId, action: 'CREATE', newStatus: 'PENDING' });
            serviceRequestsTotal.inc({ type });
            res.status(201).json(newRequest);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    /** PATCH /api/service-requests/:id */
    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status, rejectionReason, assignedAuxiliaryId } = req.body;
            const updatedByUserId = req.user?.userId;

            if (!status || !Object.values(ServiceRequestStatus).includes(status)) {
                res.status(400).json({ message: 'Estado inválido' });
                return;
            }

            const updatedRequest = await serviceRequestService.updateStatus(
                Number(id),
                status as ServiceRequestStatus,
                rejectionReason,
                assignedAuxiliaryId,
                updatedByUserId
            );
            auditService.logServiceRequest({ requestId: Number(id), changedBy: updatedByUserId, action: 'STATUS_CHANGE', newStatus: status, reason: rejectionReason });
            res.status(200).json(updatedRequest);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    /** PATCH /api/service-requests/:id/assign-auxiliary → Asignar un auxiliar a una orden aprobada */
    static async assignAuxiliary(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { auxiliaryId } = req.body;

            if (!auxiliaryId) {
                res.status(400).json({ message: 'auxiliaryId es requerido' });
                return;
            }

            const updated = await serviceRequestService.assignAuxiliary(Number(id), Number(auxiliaryId));
            auditService.logServiceRequest({ requestId: Number(id), changedBy: req.user?.userId, action: 'ASSIGN_AUXILIARY', metadata: { auxiliaryId } });
            res.status(200).json(updated);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    /** PATCH /api/service-requests/:id/submit-report → Auxiliar envía reporte de completación */
    static async submitReport(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const auxiliaryId = req.user?.userId;
            const reportData = req.body;

            if (!auxiliaryId) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            const updated = await serviceRequestService.submitReport(
                Number(id),
                auxiliaryId,
                reportData
            );
            auditService.logServiceRequest({ requestId: Number(id), changedBy: auxiliaryId, action: 'SUBMIT_REPORT', newStatus: 'COMPLETED' });
            res.status(200).json(updated);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    /** PATCH /api/service-requests/:id/review → Jefe de bodega revisa y aprueba reporte */
    static async reviewAndApproveReport(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const jefeId = req.user?.userId;
            const { approvalNotes } = req.body;

            if (!jefeId) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            const updated = await serviceRequestService.reviewAndApproveReport(
                Number(id),
                jefeId,
                approvalNotes
            );
            auditService.logServiceRequest({ requestId: Number(id), changedBy: jefeId, action: 'REVIEW_APPROVE', newStatus: 'APPROVED_BY_JEFE', metadata: { approvalNotes } });
            res.status(200).json(updated);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    /** GET /api/service-requests/:id */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const request = await serviceRequestService.getRequestById(Number(id));
            res.status(200).json(request);
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
}
