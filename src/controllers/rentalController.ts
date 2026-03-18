import { Request, Response } from 'express';
import { RentalRepository } from '../repositories/rentalRepositories.js';

const rentalRepo = new RentalRepository();

/**
 * Transforma un modelo Warehouse al formato que espera el frontend.
 */
function warehouseToFrontendFormat(w: any) {
    // Convertir a números si vienen como strings o decimales
    const length = Number(w.storageLength ?? 0);
    const width = Number(w.storageWidth ?? 0);
    const height = Number(w.storageHeight ?? 0);
    const usable = Number(w.usableArea ?? 0);
    
    // Calcular área total si tenemos dimensiones
    const totalArea = (length > 0 && width > 0) ? length * width : usable;
    
    // Determinar el área final: usar usableArea si existe, sino el cálculo
    const finalArea = usable > 0 ? usable : totalArea;

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
        storageLength: length || null,
        storageWidth: width || null,
        storageHeight: height || null,
        usableArea: usable || null,
        area: finalArea,                  // área preferida para el front, garantizado número
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

export const RentalController = {
    /** GET /api/rentals/me → Get active rentals for the authenticated user */
    async getMyRentals(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const rentals = await rentalRepo.findActiveByUser(userId);
            
            // Transformar los warehouses incluidos al formato del frontend
            const transformedRentals = rentals.map((r: any) => ({
                ...r.toJSON ? r.toJSON() : r,
                warehouse: r.warehouse ? warehouseToFrontendFormat(r.warehouse) : null
            }));

            res.status(200).json(transformedRentals);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/rentals → All rentals with client and warehouse info (admin/jefe_bodega) */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const rentals = await rentalRepo.findAllWithDetails();
            
            // Transformar los warehouses incluidos al formato del frontend
            const transformedRentals = rentals.map((r: any) => ({
                ...r.toJSON ? r.toJSON() : r,
                warehouse: r.warehouse ? warehouseToFrontendFormat(r.warehouse) : null
            }));

            res.status(200).json(transformedRentals);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
};
