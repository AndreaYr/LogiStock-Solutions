/**
 * Repositorio para tabla 'refresh_tokens'
 * Gestiona el ciclo de vida de los refresh tokens:
 * - Buscar token para renovar access token
 * - Revocar al hacer logout
 * - Limpiar tokens expirados
 */

import {Op, where} from 'sequelize';
import { BaseRepository } from "./baseRepositories.js";
import RefreshToken from "../models/refreshTokenModel.js";

export class RefreshTokenRepository extends BaseRepository<RefreshToken>{

    constructor(){
        super(RefreshToken);
    }

    // Busca un refresh token por su valor. Se usa al renovar el access token para validar que el token exista en la BD
    async findByToken(token: string): Promise<RefreshToken | null>{
        return await this.model.findOne({where: {token}});
    }

    /**
     * Revoca todos los refresh tokens activos de un usuario
     * Se usa en "Cerrar sesión en todos los dispositivos" para invalidar cualquier token que el usuario tenga activo
     */
   async revokeByUserId(userId: number): Promise<number>{
        const [affectedCount] = await this.model.update(
            {isRevoked: true},
            {where: {userId, isRevoked: false}}
        );
        return affectedCount; // Devuelve la cantidad de tokens revocados
    }

    /**
     * Revoca un refresh token específico. 
     * Se usa al hacer logout para invalidar el token que se está usando
     */
    async revokeToken(token: string): Promise<boolean>{
        const [affectedCount] = await this.model.update(
            {isRevoked: true},
            {where: {token}}
        );
    return affectedCount > 0; // Devuelve true si se revocó al menos un token
    }

    /**
     * Elimina todos los tokens expirados.
     * Se puede usar como tarea programada (cron job) para limpiar la base de datos de tokens que ya no son válidos
     */
    async deleteExpired(): Promise<number>{
        return await this.model.destroy({
            where: {
                expiresAt: { [Op.lt]: new Date()} // Elimina tokens cuya fecha de expiración es menor a la fecha actual
            }
        });
    }
}

export default new RefreshTokenRepository();