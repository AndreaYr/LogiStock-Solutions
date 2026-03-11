import { Request, Response } from 'express';
import { NoveltyService } from '../services/noveltyService.js';
import { NoveltyStatus } from '../interfaces/noveltyInterfaces.js';

const noveltyService = new NoveltyService();

export class NoveltyController {
    /** GET /api/novelties?warehouseId={id} */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const role = req.user!.role;
            const warehouseId = Number(req.query.warehouseId);
            const status = req.query.status as string;
            const type = req.query.type as string;

            if (!warehouseId) {
                res.status(400).json({ message: 'warehouseId es requerido' });
                return;
            }

            const novelties = await noveltyService.listNovelties(userId, role, warehouseId, status, type);
            res.status(200).json(novelties);
        } catch (err: any) {
            res.status(403).json({ message: err.message });
        }
    }

    /** POST /api/novelties */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const novelty = await noveltyService.createNovelty(userId, req.body);
            res.status(201).json(novelty);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    /** PATCH /api/novelties/:id */
    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !Object.values(NoveltyStatus).includes(status)) {
                res.status(400).json({ message: 'Estado inválido' });
                return;
            }

            const updatedNovelty = await noveltyService.updateStatus(Number(id), status as NoveltyStatus);
            res.status(200).json(updatedNovelty);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
}
