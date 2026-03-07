/**
 * Repositorio para tabla 'roles'
 * Hereda todo el crud de BaseRepository
 * Agrega un solo método específico para buscar rol por nombre
 */

import { BaseRepository } from "./baseRepositories.js";
import Role from "../models/roleModel.js";
import { UserRole } from "../interfaces/interfaces.js";

export class RoleRepository extends BaseRepository<Role>{

    constructor(){
        super(Role);
    } 

    // Busca un rol por su nombre (enum)
    async findByName(name: UserRole): Promise<Role | null>{
        return await this.model.findOne({ where: {name}});
    }
}

export default new RoleRepository();