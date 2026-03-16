/**
 * Controlador de solicitudes de arrendamiento (estudio previo).
 * Clientes: enviar y consultar sus solicitudes.
 * Admin: listar, aprobar y rechazar solicitudes.
 */

import { Request, Response } from 'express';
import rentalApplicationService from '../services/rentalApplicationService.js';

export const RentalApplicationController = {

    /**
     * POST /api/rental-applications
     * El cliente envía su solicitud de estudio para una bodega.
     */
    async submit(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { warehouseId, ...dto } = req.body;

            if (!warehouseId) {
                res.status(400).json({ message: 'warehouseId es requerido.' });
                return;
            }

            const application = await rentalApplicationService.submit(userId, warehouseId, dto);
            res.status(201).json({
                message: 'Solicitud enviada. Será revisada por nuestro equipo y recibirás una notificación.',
                application,
            });
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404
                : err.message.includes('activa') ? 409
                : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * GET /api/rental-applications
     * Admin: lista todas las solicitudes.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const applications = await rentalApplicationService.getAll();
            res.status(200).json(applications);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/rental-applications/my
     * Cliente: consulta sus propias solicitudes.
     */
    async getMy(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const applications = await rentalApplicationService.getByUser(userId);
            res.status(200).json(applications);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/rental-applications/:id
     * Admin: consulta una solicitud por ID.
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }

            const application = await rentalApplicationService.getById(id);
            res.status(200).json(application);
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * PATCH /api/rental-applications/:id/approve
     * Admin: aprueba una solicitud.
     */
    async approve(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }

            const adminId = req.user!.userId;
            await rentalApplicationService.approve(id, adminId);
            res.status(200).json({ message: 'Solicitud aprobada. El cliente fue notificado.' });
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404
                : err.message.includes('Solo se pueden') ? 400
                : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * PATCH /api/rental-applications/:id/reject
     * Admin: rechaza una solicitud con motivo obligatorio.
     */
    async reject(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }

            const { reason } = req.body;
            if (!reason?.trim()) {
                res.status(400).json({ message: 'El motivo del rechazo es obligatorio.' });
                return;
            }

            const adminId = req.user!.userId;
            await rentalApplicationService.reject(id, adminId, reason);
            res.status(200).json({ message: 'Solicitud rechazada. El cliente fue notificado.' });
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404
                : err.message.includes('ya aprobada') ? 400
                : 500;
            res.status(status).json({ message: err.message });
        }
    },
};
