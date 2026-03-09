import { Request, Response } from 'express';
import { AlquilerRepository } from '../repositories/alquilerRepositories.js';

const alquilerRepo = new AlquilerRepository();

export const AlquilerController = {
    /** GET /api/alquileres/me → Obtener alquileres del usuario autenticado */
    async getMyRentals(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const alquileres = await alquilerRepo.findActiveByUser(userId);
            res.status(200).json(alquileres);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
};
