import { BaseRepository } from './baseRepositories.js';
import RentalContract from '../models/rentalContractModel.js';
import { ContractStatus } from '../interfaces/rentalContractInterfaces.js';

class RentalContractRepository extends BaseRepository<RentalContract> {
    constructor() {
        super(RentalContract);
    }

    async findByApplicationId(applicationId: number): Promise<RentalContract | null> {
        return this.model.findOne({ where: { applicationId } as any });
    }

    async findByUserId(userId: number): Promise<RentalContract[]> {
        return this.model.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    }

    async findPendingAdmin(): Promise<RentalContract[]> {
        return this.model.findAll({
            where: { status: 'PENDING_ADMIN' } as any,
            order: [['createdAt', 'ASC']],
        });
    }

    async findAll(): Promise<RentalContract[]> {
        return this.model.findAll({ order: [['createdAt', 'DESC']] });
    }

    async updateStatus(id: number, status: ContractStatus): Promise<void> {
        await this.model.update({ status } as any, { where: { id } as any });
    }

    async saveClientSignature(
        id: number,
        clientSignaturePath: string,
        documentPhotoPath: string,
        documentPhotoBackPath: string
    ): Promise<void> {
        await this.model.update(
            {
                clientSignaturePath,
                documentPhotoPath,
                documentPhotoBackPath,
                status: 'PENDING_ADMIN',
                clientSignedAt: new Date(),
            } as any,
            { where: { id } as any }
        );
    }

    async saveAdminSignature(
        id: number,
        adminSignaturePath: string,
        contractHash: string,
        contractPdfPath: string
    ): Promise<void> {
        await this.model.update(
            {
                adminSignaturePath,
                contractHash,
                contractPdfPath,
                status: 'SIGNED',
                adminSignedAt: new Date(),
            } as any,
            { where: { id } as any }
        );
    }
}

export default new RentalContractRepository();
