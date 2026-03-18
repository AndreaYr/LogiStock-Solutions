import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rentalContractService from '../services/rentalContractService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const RentalContractController = {

    /**
     * POST /api/contracts/generate/:applicationId
     * Admin: genera el contrato para una solicitud aprobada.
     */
    async generate(req: Request, res: Response): Promise<void> {
        try {
            const applicationId = parseInt(String(req.params.applicationId), 10);
            if (isNaN(applicationId)) {
                res.status(400).json({ message: 'applicationId inválido.' });
                return;
            }
            const contract = await rentalContractService.generateForApplication(applicationId);
            res.status(201).json({ message: 'Contrato generado exitosamente.', contract });
        } catch (err: any) {
            const status = err.message.includes('no encontrada') ? 404
                : err.message.includes('Ya existe') ? 409
                : err.message.includes('APPROVED') ? 400
                : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * GET /api/contracts/my
     * Cliente: consulta sus contratos.
     */
    async getMy(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const contracts = await rentalContractService.getByUser(userId);
            res.status(200).json(contracts);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/contracts
     * Admin: lista todos los contratos.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const contracts = await rentalContractService.getAll();
            res.status(200).json(contracts);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /**
     * GET /api/contracts/:id
     * Detalle de un contrato.
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }
            const contract = await rentalContractService.getById(id);
            res.status(200).json(contract);
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * POST /api/contracts/:id/client-sign
     * Cliente: sube foto de cédula y firma.
     * Body: { signatureBase64: string, documentPhotoBase64: string }
     */
    async clientSign(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }

            const userId = req.user!.userId;
            const { signatureBase64, documentPhotoBase64, documentPhotoBackBase64 } = req.body;

            if (!signatureBase64 || !documentPhotoBase64 || !documentPhotoBackBase64) {
                res.status(400).json({ message: 'signatureBase64, documentPhotoBase64 y documentPhotoBackBase64 son requeridos.' });
                return;
            }

            await rentalContractService.clientSign(id, userId, signatureBase64, documentPhotoBase64, documentPhotoBackBase64);
            res.status(200).json({ message: 'Contrato firmado por el cliente. El administrador será notificado.' });
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404
                : err.message.includes('permiso') ? 403
                : err.message.includes('PENDING_CLIENT') ? 400
                : err.message.includes('formato inválido') ? 400
                : err.message.includes('demasiado pequeña') ? 400
                : err.message.includes('requerida') ? 400
                : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * POST /api/contracts/:id/admin-sign
     * Admin: firma el contrato y lo sella.
     * Body: { signatureBase64: string }
     */
    async adminSign(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }

            const { signatureBase64 } = req.body;
            if (!signatureBase64) {
                res.status(400).json({ message: 'signatureBase64 es requerido.' });
                return;
            }

            await rentalContractService.adminSign(id, signatureBase64);
            res.status(200).json({ message: 'Contrato firmado y sellado. El cliente fue notificado.' });
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404
                : err.message.includes('PENDING_ADMIN') ? 400
                : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /**
     * GET /api/contracts/:id/download
     * Descarga el PDF del contrato.
     */
    async download(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido.' });
                return;
            }

            const contract = await rentalContractService.getById(id);
            const filePath = path.resolve(__dirname, '../../', contract.contractPdfPath);

            if (!fs.existsSync(filePath)) {
                res.status(404).json({ message: 'Archivo PDF no encontrado.' });
                return;
            }

            res.download(filePath, `contrato_${id}.pdf`);
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },
};
