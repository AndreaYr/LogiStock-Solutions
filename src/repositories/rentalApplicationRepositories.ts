import { BaseRepository } from './baseRepositories.js';
import RentalApplication from '../models/rentalApplicationModel.js';
import { ApplicationStatus, OfacStatus } from '../interfaces/rentalApplicationInterfaces.js';

class RentalApplicationRepository extends BaseRepository<RentalApplication> {
    constructor() {
        super(RentalApplication);
    }

    /** Solicitudes de un cliente específico */
    async findByUserId(userId: number): Promise<RentalApplication[]> {
        return this.model.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    }

    /** Todas las solicitudes (admin) ordenadas por fecha */
    async findAllWithOrder(): Promise<RentalApplication[]> {
        return this.model.findAll({ order: [['createdAt', 'DESC']] });
    }

    /** Solicitudes pendientes de revisión (admin) */
    async findPending(): Promise<RentalApplication[]> {
        return this.model.findAll({
            where: { status: 'PENDING' },
            order: [['createdAt', 'ASC']],
        });
    }

    /** Actualiza el status y opcionalmente el motivo de rechazo */
    async updateStatus(
        id: number,
        status: ApplicationStatus,
        reviewedBy: number,
        rejectionReason?: string
    ): Promise<void> {
        await this.model.update(
            {
                status,
                reviewedBy,
                reviewedAt: new Date(),
                ...(rejectionReason ? { rejectionReason } : {}),
            },
            { where: { id } as any }
        );
    }

    /** Actualiza el resultado de la verificación OFAC */
    async updateOfacStatus(id: number, ofacStatus: OfacStatus): Promise<void> {
        await this.model.update({ ofacStatus } as any, { where: { id } as any });
    }

    /**
     * Verifica si el cliente ya tiene una solicitud activa (PENDING o APPROVED)
     * para la misma bodega — evita solicitudes duplicadas
     */
    async hasActiveApplication(userId: number, warehouseId: number): Promise<boolean> {
        const existing = await this.model.findOne({
            where: {
                userId,
                warehouseId,
                status: ['PENDING', 'UNDER_REVIEW', 'APPROVED'],
            } as any,
        });
        return existing !== null;
    }
}

export default new RentalApplicationRepository();
