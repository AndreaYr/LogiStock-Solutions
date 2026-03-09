import { Request, Response } from 'express';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';

const warehouseRepo = new WarehouseRepository();

export const WarehouseController = {
    /** GET /api/warehouses → List all warehouses */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const warehouses = await warehouseRepo.findAll();
            res.status(200).json(warehouses);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** POST /api/warehouses → Create a warehouse (Admin only) */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const warehouse = await warehouseRepo.create(req.body);
            res.status(201).json(warehouse);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
};
