import { Request, Response } from 'express';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';

const warehouseRepo = new WarehouseRepository();

/**
 * Transforma un modelo Warehouse al formato que espera el frontend.
 */
function toFrontendFormat(w: any) {
    const totalArea = w.storageLength && w.storageWidth
        ? Number(w.storageLength) * Number(w.storageWidth)
        : 0;

    return {
        id: w.id,
        // ── Identificación ──────────────────────────────────
        name: w.name,
        nombre: w.name,                                    // alias español
        description: w.description ?? '',
        warehouseType: w.warehouseType ?? 'GENERAL',
        type: w.warehouseType ?? 'GENERAL',               // alias usado por el front
        // ── Ubicación ───────────────────────────────────────
        address: w.address ?? null,
        ubicacion: w.address ?? '—',                      // alias español
        city: w.city ?? null,
        postalCode: w.postalCode ?? null,
        // ── Dimensiones ─────────────────────────────────────
        storageLength: w.storageLength ?? null,
        storageWidth: w.storageWidth ?? null,
        storageHeight: w.storageHeight ?? null,
        usableArea: w.usableArea ?? null,
        area: w.usableArea ?? totalArea,                  // área preferida para el front
        // ── Ocupación ───────────────────────────────────────
        capacityOccupied: Number(w.capacityOccupied ?? 0),
        capacidadOcupado: Number(w.capacityOccupied ?? 0), // alias español
        // ── Servicios públicos ───────────────────────────────
        utilitiesIncluded: w.utilitiesIncluded ?? false,
        utilitiesResponsible: w.utilitiesResponsible ?? null,
        utilitiesDetails: w.utilitiesDetails ?? null,
        // ── Instalaciones ────────────────────────────────────
        hasSecuritySystem: w.hasSecuritySystem ?? false,
        hasLoadingDock: w.hasLoadingDock ?? false,
        hasParking: w.hasParking ?? false,
        accessHours: w.accessHours ?? null,
        // ── Disponibilidad / precio ──────────────────────────
        isAvailable: w.isAvailable ?? true,
        disponible: w.isAvailable ?? true,                // alias español
        monthlyPrice: Number(w.monthlyPrice ?? 0),
        precioMensual: Number(w.monthlyPrice ?? 0),       // alias español
        imageUrl: w.imageUrl ?? null,
        imagenUrl: w.imageUrl ?? null,                    // alias español
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
