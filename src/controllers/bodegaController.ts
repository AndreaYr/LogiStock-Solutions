import { Request, Response } from 'express';
import bodegaRepository from '../repositories/bodegaRepositories.js';

class BodegaController {

    // Obtener todas las bodegas
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const bodegas = await bodegaRepository.findAll();
            res.json(bodegas);
        } catch (error) {
            console.error('Error al obtener bodegas:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener bodegas' });
        }
    }

    // Crear una nueva bodega
    async create(req: Request, res: Response): Promise<void> {
        try {
            // Se debe usar Validation Middleware en Rutas para asegurar el body
            const nuevaBodega = await bodegaRepository.create(req.body);
            res.status(201).json(nuevaBodega);
        } catch (error) {
            console.error('Error al crear bodega:', error);
            res.status(500).json({ message: 'Error interno del servidor al crear bodega' });
        }
    }
}

export default new BodegaController();
