import { Request, Response } from 'express';
import { ServiceRequestService } from '../services/serviceRequestService.js';
import { ServiceRequestStatus, ServiceRequestType } from '../interfaces/serviceRequestInterfaces.js';

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
            const userId = req.user!.userId;
            const status = req.query.status as string | undefined;
            const requests = await serviceRequestService.listMyRequests(userId, status);
            res.status(200).json(requests);
        } catch (err: any) {
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

    /** POST /api/service-requests */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { warehouseId, type, product, quantity, description } = req.body;

            if (!warehouseId || !type || !Object.values(ServiceRequestType).includes(type)) {
                res.status(400).json({ message: 'Datos incompletos o tipo inválido' });
                return;
            }

            const newRequest = await serviceRequestService.createRequest(userId, {
                warehouseId,
                type,
                product,
                quantity,
                description
            });
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
