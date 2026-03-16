/**
 * Controller de usuarios
 * Requiere autenticación en todas las rutas.
 * Solo ADMIN puede listar todos y desactivar cuentas.
 */

import { Request, Response } from 'express';
import userService from '../services/userService.js';

export const UserController = {

    /** GET /api/users  → solo ADMIN, con soporte para query param role */
    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const role = req.query.role as string | undefined;
            
            let users;
            if (role) {
                users = await userService.findByRole(role);
            } else {
                users = await userService.findAll();
            }
            
            res.status(200).json(users);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** GET /api/users/:id  → el propio usuario o ADMIN */
    async findById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);

            // Solo puede ver su propio perfil, a menos que sea admin
            if (req.user!.userId !== id && req.user!.role !== 'admin') {
                res.status(403).json({ message: 'No tienes permisos para ver este perfil.' });
                return;
            }

            const user = await userService.findById(id);
            res.status(200).json(user);
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /** GET /api/users/me  → perfil propio */
    async me(req: Request, res: Response): Promise<void> {
        try {
            const user = await userService.findById(req.user!.userId);
            res.status(200).json(user);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },

    /** PUT /api/users/:id  → actualizar perfil */
    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);

            if (req.user!.userId !== id && req.user!.role !== 'admin') {
                res.status(403).json({ message: 'No tienes permisos para modificar este perfil.' });
                return;
            }

            const { firstName, lastName, phone } = req.body;
            const updated = await userService.updateProfile(id, { firstName, lastName, phone });
            res.status(200).json({ message: 'Perfil actualizado.', user: updated });
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /** PATCH /api/users/:id/password  → cambiar contraseña */
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);

            if (req.user!.userId !== id) {
                res.status(403).json({ message: 'Solo puedes cambiar tu propia contraseña.' });
                return;
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'currentPassword y newPassword son requeridos.' });
                return;
            }

            await userService.changePassword(id, { currentPassword, newPassword });
            res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
        } catch (err: any) {
            const status = err.message.includes('incorrecta') ? 400 : 500;
            res.status(status).json({ message: err.message });
        }
    },

    /** DELETE /api/users/:id  → desactivar cuenta (solo ADMIN) */
    async deactivate(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id), 10);
            await userService.deactivate(id);
            res.status(200).json({ message: 'Cuenta desactivada.' });
        } catch (err: any) {
            const status = err.message.includes('no encontrado') ? 404 : 500;
            res.status(status).json({ message: err.message });
        }
    },
};
