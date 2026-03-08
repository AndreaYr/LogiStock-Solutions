/**
 * Servicio para manejar las operaciones relacionadas con los roles de usuario.
 */

import roleRepository from "../repositories/roleRepositories.js";
import { UserRole } from "../interfaces/interfaces.js";
import Role from "../models/roleModel.js";

class RoleService {
    async getAll(): Promise<Role[]>{
        return roleRepository.findAll();
    }

    async getById(id:number): Promise<Role | null>{
        return roleRepository.findById(id);
    }

    async getByName(name: UserRole): Promise<Role | null>{
        return roleRepository.findByName(name);
    }
}

export default new RoleService();