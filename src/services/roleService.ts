/**
 * Servicio de roles
 * Expone la lista de roles disponibles en el sistema.
 */

import roleRepository from '../repositories/roleRepositories.js';

class RoleService {

    /** Retorna todos los roles del sistema */
    async findAll() {
        return roleRepository.findAll();
    }

    /** Busca un rol por ID */
    async findById(id: number) {
        const role = await roleRepository.findById(id);
        if (!role) throw new Error('Rol no encontrado.');
        return role;
    }
}

export default new RoleService();
