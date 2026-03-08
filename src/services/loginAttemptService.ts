/**
 * Registra intentos de login y evalua si un email debe ser bloqueado
 */

import loginAttemptRepository from "../repositories/loginAttemptRepositories.js";
import { ILoginAttemptCreationAttributes } from "../interfaces/interfaces.js";
import { env } from '../config/env.js';
import LoginAttempt from "../models/loginAttemptModel.js";

class LoginAttemptService {
    //Registra un nuevo intento de login
    async register(data: ILoginAttemptCreationAttributes): Promise<LoginAttempt> {
        return loginAttemptRepository.create(data);
    }

    // cuantos intentos fallidos recientes tiene el email
    async countRecentFailed(email: string): Promise<number> {
        return loginAttemptRepository.countFailedByEmail(email);
    }

    //Historial de intentos de un email
    /* async getRecentByEmail(email: string): Promise<LoginAttempt[]>{
        return loginAttemptRepository.findRecentByEmail(email);
    } */

    // true si supero el maximo de intentos permitidos
    async isBlocked(email: string): Promise<boolean> {
        const count = await this.countRecentFailed(email);
        return count >= 5; // Valor por defecto
    }
}

export default new LoginAttemptService();