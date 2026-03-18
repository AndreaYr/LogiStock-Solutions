/**
 * Servicio de usuarios
 * Gestión de perfil, listado y desactivación de cuentas.
 */

import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepositories.js';
import { IUserAttributes } from '../interfaces/interfaces.js';

const userRepo = new UserRepository();

export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

class UserService {

    /** Lista todos los usuarios (solo admin) */
    async findAll() {
        return userRepo.findAll({
            attributes: { exclude: ['password'] },
        });
    }

    /** Lista usuarios filtrando por role (a través de la asociación con roles) */
    async findByRole(role: string) {
        return (await userRepo.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    association: 'role',
                    where: { roleName: role },
                    attributes: ['id', 'roleName'],
                    required: true,
                }
            ],
        })) as any;
    }

    /** Obtiene un usuario por ID sin exponer la contraseña */
    async findById(id: number) {
        const user = await userRepo.findById(id, {
            attributes: { exclude: ['password'] },
        });
        if (!user) throw new Error('Usuario no encontrado.');
        return user;
    }

    /** Actualiza el perfil del usuario (nombre, teléfono) */
    async updateProfile(id: number, dto: UpdateProfileDto) {
        const user = await userRepo.findById(id);
        if (!user) throw new Error('Usuario no encontrado.');

        await userRepo.update(id, dto as Partial<IUserAttributes>);
        return userRepo.findById(id, { attributes: { exclude: ['password'] } });
    }

    /** Cambia la contraseña validando la actual */
    async changePassword(id: number, dto: ChangePasswordDto) {
        const user = await userRepo.findById(id);
        if (!user) throw new Error('Usuario no encontrado.');

        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid) throw new Error('La contraseña actual es incorrecta.');

        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await userRepo.update(id, { password: hashed });
    }

    /** Desactiva la cuenta (soft-delete lógico) */
    async deactivate(id: number) {
        const user = await userRepo.findById(id);
        if (!user) throw new Error('Usuario no encontrado.');
        await userRepo.update(id, { isActive: false });
    }
}

export default new UserService();
