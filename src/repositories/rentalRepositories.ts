import { BaseRepository } from "./baseRepositories.js";
import Rental from "../models/rentalModel.js";
import Warehouse from "../models/warehouseModel.js";
import User from "../models/userModel.js";

export class RentalRepository extends BaseRepository<Rental> {
    constructor() {
        super(Rental);
    }

    /**
     * Finds active rentals for a user, including warehouse information.
     */
    async findActiveByUser(userId: number) {
        return this.model.findAll({
            where: { userId, status: 'ACTIVE' },
            include: [
                {
                    model: Warehouse,
                    as: 'warehouse'
                }
            ]
        });
    }

    /**
     * Returns all rentals with user (client) and warehouse information.
     * Used by admin and jefe_bodega.
     */
    async findAllWithDetails() {
        return this.model.findAll({
            include: [
                {
                    model: Warehouse,
                    as: 'warehouse'
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
}
