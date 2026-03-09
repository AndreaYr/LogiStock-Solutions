import { Request, Response } from 'express';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';

const warehouseRepo = new WarehouseRepository();

/**
 * Transforma un modelo Warehouse al formato que espera el frontend.
 * El frontend usa campos en español (nombre, ubicacion, precioMensual, area, imagenUrl, etc.)
 */
function toFrontendFormat(w: any) {
    const area = w.storageLength && w.storageWidth
        ? Number(w.storageLength) * Number(w.storageWidth)
        : 0;

    return {
        id: w.id,
        // Aliases en español para compatibilidad con el frontend
        nombre: w.description,
        ubicacion: w.address ?? '—',
        precioMensual: Number(w.monthlyPrice ?? 0),
        area,
        capacidadOcupado: Number(w.capacityOccupied ?? 0),
        imagenUrl: w.imageUrl ?? null,
        estado: 'activa',
        disponible: true,
        // También enviamos en inglés por si acaso
        description: w.description,
        address: w.address,
        monthlyPrice: Number(w.monthlyPrice ?? 0),
        capacityOccupied: Number(w.capacityOccupied ?? 0),
        imageUrl: w.imageUrl,
        storageLength: w.storageLength,
        storageWidth: w.storageWidth,
        storageHeight: w.storageHeight,
        postalCode: w.postalCode,
    };
}

export const WarehouseController = {
    /** GET /api/warehouses → List all warehouses */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const warehouses = await warehouseRepo.findAll();
            res.status(200).json(warehouses.map(toFrontendFormat));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** POST /api/warehouses → Create a warehouse (Admin only) */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const warehouse = await warehouseRepo.create(req.body);
            res.status(201).json(toFrontendFormat(warehouse));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
};
