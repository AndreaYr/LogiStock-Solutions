/**
 * Orquesta todo lo relacionado con autenticacion
 */

import bcrypt from "bcryptjs";
import {env} from '../config/env.js';
import { UserRepository } from "../repositories/userRepositories.js";
import { RoleRepository } from "../repositories/roleRepositories.js";
import { LoginAttemptRepository } from "../repositories/loginAttemptRepositories.js";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepositories.js";
import tokenService, { JwtAccessPayload } from "./tokenService.js";
import { IUserCreationAttributes, IUser } from "../interfaces/interfaces.js";
//import {UnauthorizedError, BadRequestError} from "../utils/errors.js";

class AuthService {
    constructor(
        private users = UserRepository,
        private roles = RoleRepository,
        private attempts = LoginAttemptRepository,
        private refreshTokens = RefreshTokenRepository,
        private tokens = tokenService,
    ) {}

    async login(
        email: string,
        password: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<{accessToken: string; refreshToken: string}>
        const user = await this.users
        
    )
}