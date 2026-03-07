/**
 * Repositorio para tabla 'login_attempts'
 * Está tabla es de solo escritura (solo insert + select, nunca update ni delete) 
 * Cada intento de login genera un registro nuevo, sin modificar los anteriores.
 * 
 * Sus métodos alimentan la lógica de seguridad del auth.service:
 * 1. Registrar cada intento de login, exitoso o fallido, para tener un historial completo.
 * 2. Consultar intentos fallidos recientes para decidir si bloquear
 * 3. Contar intentos fallidos para comparar con MAX_LOGIN_ATTEMPTS 
 */
import {LOCK, Op} from 'sequelize';
import { BaseRepository } from "./baseRepositories.js";
import LoginAttempt from "../models/loginAttemptModel.js";
import { ILoginAttemptCreationAttributes } from '../interfaces/interfaces.js';

const LOCK_TIME_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || '15', 10); // Tiempo de bloqueo en minutos

export class LoginAttemptRepository extends BaseRepository<LoginAttempt>{

    constructor(){
        super(LoginAttempt);
    }

    // Registra un nuevo intento de login. Se llama siempre que alguien intenta iniciar sesión, si es exitoso o no.
    async create(data:ILoginAttemptCreationAttributes): Promise<LoginAttempt>{
        return await this.model.create(data as any);
    }

    // Obtiene los intentos recientes de un email(exitosos y fallidos), es util para mostrar historial de acceso al usuario o para auditoria
    async findByEmail(
        email: string,
        minutes: number = LOCK_TIME_MINUTES
    ): Promise<LoginAttempt[]>{
        const since = new Date(Date.now() - minutes * 60 * 1000);
        return await this.model.findAll({
            where: {
                email,
                attemptedAt: {[Op.gte]: since} // Solo intentos desde los últimos X minutos
            },
            order: [['attemptedAt', 'DESC']] // Ordenados del más reciente al más antiguo
        });
    }

    // Cuenta los ikntentos fallidos de un email en la ventana de tiempo, es el método clave para la lógica del bloqueo de cuenta
    async countFailedByEmail(
        email: string,
        minutes: number = LOCK_TIME_MINUTES
    ):Promise<number>{
        const since = new Date(Date.now() - minutes * 60 * 1000);

        return await this.model.count({
            where: {
                email,
                success: false, // Solo cuenta los intentos fallidos
                attemptedAt: {[Op.gte]: since} // Solo intentos desde los últimos X minutos
            }
        });
    }
}

export default new LoginAttemptRepository();