import { Request, Response } from 'express';
import { RentalRepository } from '../repositories/rentalRepositories.js';

const rentalRepo = new RentalRepository();

export const RentalController = {
    /** GET /api/rentals/me → Get active rentals for the authenticated user */
    async getMyRentals(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const rentals = await rentalRepo.findActiveByUser(userId);
            res.status(200).json(rentals);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/rentals → All rentals with client and warehouse info (admin/jefe_bodega) */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const rentals = await rentalRepo.findAllWithDetails();
            res.status(200).json(rentals);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
};
