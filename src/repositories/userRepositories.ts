/**
 * Repositorio para tabla 'users'
 * Extiende de BaseRepository con métodos especificos para autenticación
 * - Busca por gmail
 * - Gestión de bloqueo de cuentas por intentos fallidos
 */

import { Op } from "sequelize";
import { BaseRepository } from "./baseRepositories.js";
import User from "../models/userModel.js";
import LoginAttempt from "../models/loginAttemptModel.js";

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCK_TIME_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || '15', 10);

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    // Busca un usuario por su email
    async findByEmail(email: string): Promise<User | null> {
        return await this.model.findOne({ where: { email } });
    }

    /**
    * Busca un usuario por su ID
    * Este método requiere agregar el campo `providerId` a la tabla users
    * cuando se implemente la autenticación con Azure AD en un sprint futuro.
    * Por ahora retorna null para no bloquear el sprint actual.
    *
    * @param providerId - El ID único del proveedor (ej: Azure AD object ID) 
    */

    async findByProviderId(providerId: string): Promise<User | null> {
        return null;
    }

    /**
     * Cuenta los intentos de login fallidos del usuario
     * Se usa para decidir si bloquear la cuenta:
     * - Si retorna >= MAX_LOGIN_ATTEMPTS → llamar a lockAccount()
     */
    async incrementFailedAttempts(userId: number): Promise<number> {
        //ventana de tiempo: ahora menos LOCK_TIME_MINUTES
        const since = new Date(Date.now() - LOCK_TIME_MINUTES * 60 * 1000);

        const count = await LoginAttempt.count({
            where: {
                userId,
                success: false,
                attemptedAt: { [Op.gte]: since },
            } as any,
        });

        return count;
    }

    // Reactiva la cuenta del usuario, se llama cuando el usuario hace login exitoso.
    async resetFailedAttempts(userId: number): Promise<void> {
        await this.model.update(
            { isActive: true },
            { where: { id: userId } }
        );
    }

    async lockAccount(userId: number): Promise<void> {
        await this.model.update(
            { isActive: false },
            { where: { id: userId } }
        );
    }

    async anonymize(userId: number): Promise<void> {
        const crypto = await import('crypto');
        const randomSuffix = crypto.default.randomBytes(8).toString('hex');
        await this.model.update(
            {
                firstName: 'Eliminado',
                lastName: '',
                phone: null,
                email: `deleted_${userId}_${randomSuffix}@anonymized.logistock.com`,
                password: await (await import('bcryptjs')).default.hash(crypto.default.randomBytes(32).toString('hex'), 10),
                resetPasswordToken: null,
                resetPasswordExpires: null,
                emailVerificationToken: null,
                emailVerificationExpires: null,
                otpCode: null,
                otpExpires: null,
                isActive: false,
                isAnonymized: true,
                cancellationDate: null,
            } as any,
            { where: { id: userId } }
        );
    }
}

export default new UserRepository();