import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';
import Warehouse from '../models/warehouseModel.js';
import Rental from '../models/rentalModel.js';
import { env } from '../config/env.js';
import auditService from '../services/auditService.js';
import { warehouseOperationsTotal } from '../config/metrics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const warehouseRepo = new WarehouseRepository();

/**
 * Transforma un modelo Warehouse al formato que espera el frontend.
 */
function toFrontendFormat(w: any, isRented = false) {
    const length = Number(w.storageLength ?? 0);
    const width = Number(w.storageWidth ?? 0);
    const usable = Number(w.usableArea ?? 0);
    const totalArea = (length > 0 && width > 0) ? length * width : usable;
    const finalArea = usable > 0 ? usable : totalArea;

    return {
        id: w.id,
        code: w.code ?? null,
        name: w.name,
        nombre: w.name,
        description: w.description ?? '',
        warehouseType: w.warehouseType ?? 'GENERAL',
        type: w.warehouseType ?? 'GENERAL',
        address: w.address ?? null,
        ubicacion: w.address ?? '—',
        city: w.city ?? null,
        postalCode: w.postalCode ?? null,
        storageLength: length || null,
        storageWidth: width || null,
        storageHeight: Number(w.storageHeight ?? 0) || null,
        usableArea: usable || null,
        area: finalArea,
        capacityOccupied: Number(w.capacityOccupied ?? 0),
        capacidadOcupado: Number(w.capacityOccupied ?? 0),
        utilitiesIncluded: w.utilitiesIncluded ?? false,
        utilitiesResponsible: w.utilitiesResponsible ?? null,
        utilitiesDetails: w.utilitiesDetails ?? null,
        hasSecuritySystem: w.hasSecuritySystem ?? false,
        hasLoadingDock: w.hasLoadingDock ?? false,
        hasParking: w.hasParking ?? false,
        accessHours: w.accessHours ?? null,
        isAvailable: w.isAvailable ?? true,
        disponible: w.isAvailable ?? true,
        isRented,
        monthlyPrice: Number(w.monthlyPrice ?? 0),
        precioMensual: Number(w.monthlyPrice ?? 0),
        imageUrl: w.imageUrl ?? null,
        imagenUrl: w.imageUrl ?? null,
    };
}

/** Genera un código único de 6 dígitos para una bodega nueva */
async function generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const existing = await Warehouse.findOne({ where: { code } });
        if (!existing) return code;
    }
    throw new Error('No se pudo generar un código único. Intenta de nuevo.');
}

/** Obtiene el Set de warehouseIds con arrendamiento ACTIVO */
async function getRentedWarehouseIds(): Promise<Set<number>> {
    const activeRentals = await Rental.findAll({ where: { status: 'ACTIVE' } });
    return new Set(activeRentals.map((r: any) => r.warehouseId));
}

export const WarehouseController = {

    /** GET /api/warehouses → Lista todas las bodegas */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const warehouses = await warehouseRepo.findAll();
            const rentedIds = await getRentedWarehouseIds();
            res.status(200).json(warehouses.map(w => toFrontendFormat(w, rentedIds.has((w as any).id))));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/warehouses/:id → Detalle de una bodega */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) { res.status(400).json({ message: 'ID inválido.' }); return; }
            const warehouse = await warehouseRepo.findById(id);
            if (!warehouse) { res.status(404).json({ message: 'Bodega no encontrada.' }); return; }
            const activeRental = await Rental.findOne({ where: { warehouseId: id, status: 'ACTIVE' } });
            res.status(200).json(toFrontendFormat(warehouse, !!activeRental));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** POST /api/warehouses → Crear bodega (Admin) */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const code = await generateUniqueCode();
            const warehouse = await warehouseRepo.create({ ...req.body, code });
            auditService.logWarehouse({ warehouseId: (warehouse as any).id, changedBy: req.user?.userId, action: 'CREATE', changes: req.body });
            warehouseOperationsTotal.inc({ action: 'CREATE' });
            res.status(201).json(toFrontendFormat(warehouse));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** PUT /api/warehouses/:id → Actualizar datos de bodega (Admin) */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) { res.status(400).json({ message: 'ID inválido.' }); return; }
            const warehouse = await warehouseRepo.findById(id);
            if (!warehouse) { res.status(404).json({ message: 'Bodega no encontrada.' }); return; }
            const before = { ...(warehouse as any).dataValues };
            await warehouseRepo.update(id, req.body);
            const updated = await warehouseRepo.findById(id);
            auditService.logWarehouse({ warehouseId: id, changedBy: req.user?.userId, action: 'UPDATE', changes: { before, after: req.body } });
            warehouseOperationsTotal.inc({ action: 'UPDATE' });
            const activeRental = await Rental.findOne({ where: { warehouseId: id, status: 'ACTIVE' } });
            res.status(200).json(toFrontendFormat(updated, !!activeRental));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** PATCH /api/warehouses/:id/toggle-status → Activar/inactivar bodega (Admin) */
    async toggleStatus(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) { res.status(400).json({ message: 'ID inválido.' }); return; }
            const warehouse = await warehouseRepo.findById(id);
            if (!warehouse) { res.status(404).json({ message: 'Bodega no encontrada.' }); return; }
            const newStatus = !(warehouse as any).isAvailable;
            await warehouseRepo.update(id, { isAvailable: newStatus } as any);
            auditService.logWarehouse({ warehouseId: id, changedBy: req.user?.userId, action: 'TOGGLE_STATUS', changes: { isAvailable: newStatus } });
            warehouseOperationsTotal.inc({ action: 'TOGGLE_STATUS' });
            const updated = await warehouseRepo.findById(id);
            const activeRental = await Rental.findOne({ where: { warehouseId: id, status: 'ACTIVE' } });
            res.status(200).json(toFrontendFormat(updated, !!activeRental));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** POST /api/warehouses/:id/images → Subir imágenes de bodega (Admin) */
    async uploadImages(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            if (isNaN(id)) { res.status(400).json({ message: 'ID inválido.' }); return; }
            const warehouse = await warehouseRepo.findById(id);
            if (!warehouse) { res.status(404).json({ message: 'Bodega no encontrada.' }); return; }
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                res.status(400).json({ message: 'No se enviaron imágenes.' });
                return;
            }
            const newUrls = (req.files as Express.Multer.File[]).map(
                f => `${env.BACKEND_URL}/uploads/warehouses/${f.filename}`
            );
            const raw = (warehouse as any).imageUrl;
            const existing: string[] = Array.isArray(raw) ? raw : (raw ? [raw] : []);
            const merged = [...existing, ...newUrls];
            await warehouseRepo.update(id, { imageUrl: merged } as any);
            auditService.logWarehouse({ warehouseId: id, changedBy: req.user?.userId, action: 'UPLOAD_IMAGES', changes: { addedImages: newUrls.length } });
            warehouseOperationsTotal.inc({ action: 'UPLOAD_IMAGES' });
            const updated = await warehouseRepo.findById(id);
            res.status(200).json(toFrontendFormat(updated));
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },
};
