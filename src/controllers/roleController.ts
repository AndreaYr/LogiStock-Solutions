/**
 * Controller de roles
 * Solo ADMIN puede consultar los roles.
 */

import { Request, Response } from 'express';
import roleService from '../services/roleService.js';

export const RoleController = {

    /** GET /api/roles */
    async findAll(_req: Request, res: Response): Promise<void> {
        try {
            const roles = await roleService.findAll();
            res.status(200).json(roles);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/roles/:id */
    async findById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            const role = await roleService.findById(id);
            res.status(200).json(role);
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },
};
