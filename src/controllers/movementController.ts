import { Request, Response } from 'express';
import movementRepo from '../repositories/movementRepositories.js';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';
import notificationService from '../services/notificationService.js';

const warehouseRepo = new WarehouseRepository();

export const MovementController = {

    /** POST /api/movements → Registrar un nuevo movimiento (Entrada/Salida) */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.user!;
            const { warehouseId, type, product, quantity, description } = req.body;

            if (!warehouseId || !type || !product || !quantity) {
                res.status(400).json({ message: 'warehouseId, type, product y quantity son requeridos.' });
                return;
            }

            // Validar que la bodega existe
            const warehouse = await warehouseRepo.findById(warehouseId);
            if (!warehouse) {
                res.status(404).json({ message: 'Bodega no encontrada.' });
                return;
            }

            // Registrar movimiento
            const movement = await movementRepo.create({
                userId,
                warehouseId,
                type,
                product,
                quantity,
                description: description ?? null,
            });

            // Disparar notificación
            const typeInSpanish = type.toLowerCase() as 'entrada' | 'salida' | 'traslado';
            await notificationService.notifyMovement(
                userId,
                typeInSpanish,
                product,
                quantity,
                warehouse.description
            ).catch(console.error);

            res.status(201).json(movement);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/movements → Listar todos los movimientos o filtrar por warehouseId */
    async list(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = req.query.warehouseId ? parseInt(req.query.warehouseId as string, 10) : undefined;
            const options: any = {
                order: [['createdAt', 'DESC']],
                include: [
                    { 
                        association: 'user', 
                        attributes: ['id', 'firstName', 'lastName', 'email'] 
                    },
                    { 
                        association: 'warehouse', 
                        attributes: ['id', 'description'] 
                    }
                ]
            };

            if (warehouseId) {
                options.where = { warehouseId };
            }

            const movements = await movementRepo.findAll(options);
            res.status(200).json(movements);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/movements/warehouse/:id → Listar movimientos de una bodega */
    async getByWarehouse(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = parseInt(req.params.id as string, 10);
            const movements = await movementRepo.findAll({
                where: { warehouseId },
                order: [['createdAt', 'DESC']],
                include: [
                    { 
                        association: 'user', 
                        attributes: ['id', 'firstName', 'lastName', 'email'] 
                    },
                    { 
                        association: 'warehouse', 
                        attributes: ['id', 'description'] 
                    }
                ]
            });
            res.status(200).json(movements);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
};
