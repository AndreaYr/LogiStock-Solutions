/**
 * Servicio de solicitudes de arrendamiento (estudio previo).
 * Orquesta: creación, verificación OFAC, aprobación y rechazo.
 */

import rentalApplicationRepo from '../repositories/rentalApplicationRepositories.js';
import { UserRepository } from '../repositories/userRepositories.js';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';
import rentalContractService from './rentalContractService.js';

const warehouseRepo = new WarehouseRepository();
import notificationService from './notificationService.js';
import { checkName } from './ofacService.js';
import RentalApplication from '../models/rentalApplicationModel.js';

const userRepo = new UserRepository();

export interface SubmitApplicationDto {
    documentType: 'CC' | 'CE' | 'PASAPORTE';
    documentNumber: string;
    phone: string;
    address: string;
    businessActivity: string;
    merchandiseType: string;
    commercialRefName: string;
    commercialRefPhone: string;
    hasDangerousGoods: boolean;
    requiresRefrigeration: boolean;
    acceptsTerms: boolean;
    rentalDuration: 'MONTHLY' | 'SEMESTER' | 'ANNUAL';
}

class RentalApplicationService {

    /**
     * El cliente envía la solicitud de estudio para una bodega.
     * 1. Valida que no exista solicitud activa para esa bodega.
     * 2. Crea la solicitud en BD con status PENDING.
     * 3. Verifica el nombre del solicitante en listas OFAC/ONU.
     * 4. Si está marcado (FLAGGED) → rechaza automáticamente.
     * 5. Si está limpio (CLEAR) → notifica al admin.
     */
    async submit(userId: number, warehouseId: number, dto: SubmitApplicationDto): Promise<RentalApplication> {
        // Validar que la bodega existe
        const warehouse = await warehouseRepo.findById(warehouseId);
        if (!warehouse) throw new Error('Bodega no encontrada.');

        // Validar que el usuario no tenga ya una solicitud activa para esta bodega
        const alreadyExists = await rentalApplicationRepo.hasActiveApplication(userId, warehouseId);
        if (alreadyExists) throw new Error('Ya tienes una solicitud activa para esta bodega.');

        // Validar que acepta los términos
        if (!dto.acceptsTerms) throw new Error('Debes aceptar los términos y condiciones.');

        // Crear la solicitud
        const application = await rentalApplicationRepo.create({
            userId,
            warehouseId,
            ...dto,
            status: 'PENDING',
            ofacStatus: 'PENDING',
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
        });

        // Notificar al cliente que la solicitud fue recibida
        const warehouseName = (warehouse as any).description ?? (warehouse as any).name ?? `Bodega #${warehouseId}`;
        notificationService.notifyApplicationSubmitted(userId, warehouseName).catch(console.error);

        // Verificación OFAC en segundo plano (no bloquea la respuesta)
        this._runOfacCheck(application.id, userId, warehouseId, warehouseName).catch(console.error);

        return application;
    }

    /**
     * El admin aprueba una solicitud.
     * Cambia status a APPROVED y notifica al cliente.
     */
    async approve(applicationId: number, adminId: number): Promise<void> {
        const application = await rentalApplicationRepo.findById(applicationId);
        if (!application) throw new Error('Solicitud no encontrada.');

        if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
            throw new Error('Solo se pueden aprobar solicitudes en estado PENDING o UNDER_REVIEW.');
        }

        await rentalApplicationRepo.updateStatus(applicationId, 'APPROVED', adminId);

        const warehouse = await warehouseRepo.findById(application.warehouseId);
        const warehouseName = (warehouse as any)?.description ?? (warehouse as any)?.name ?? `Bodega #${application.warehouseId}`;

        notificationService.notifyApplicationApproved(application.userId, warehouseName).catch(console.error);

        // Generar contrato PDF automáticamente
        rentalContractService.generateForApplication(applicationId).catch(err => {
            console.error(`[RentalApplicationService] ❌ Error generando contrato para solicitud #${applicationId}:`, err);
        });
    }

    /**
     * El admin rechaza una solicitud con un motivo obligatorio.
     * Cambia status a REJECTED y notifica al cliente.
     */
    async reject(applicationId: number, adminId: number, reason: string): Promise<void> {
        if (!reason?.trim()) throw new Error('El motivo del rechazo es obligatorio.');

        const application = await rentalApplicationRepo.findById(applicationId);
        if (!application) throw new Error('Solicitud no encontrada.');

        if (application.status === 'APPROVED') {
            throw new Error('No se puede rechazar una solicitud ya aprobada.');
        }

        await rentalApplicationRepo.updateStatus(applicationId, 'REJECTED', adminId, reason.trim());

        const warehouse = await warehouseRepo.findById(application.warehouseId);
        const warehouseName = (warehouse as any)?.description ?? (warehouse as any)?.name ?? `Bodega #${application.warehouseId}`;

        notificationService.notifyApplicationRejected(application.userId, warehouseName, reason.trim()).catch(console.error);
    }

    /** Retorna todas las solicitudes (para el panel admin) */
    async getAll(): Promise<RentalApplication[]> {
        return rentalApplicationRepo.findAllWithOrder();
    }

    /** Retorna las solicitudes de un cliente específico */
    async getByUser(userId: number): Promise<RentalApplication[]> {
        return rentalApplicationRepo.findByUserId(userId);
    }

    /** Retorna una solicitud por ID */
    async getById(applicationId: number): Promise<RentalApplication> {
        const application = await rentalApplicationRepo.findById(applicationId);
        if (!application) throw new Error('Solicitud no encontrada.');
        return application;
    }

    // ─── Privado ──────────────────────────────────────────────────────────────

    /**
     * Ejecuta la verificación OFAC/ONU en segundo plano.
     * Si FLAGGED → rechaza automáticamente la solicitud.
     */
    private async _runOfacCheck(
        applicationId: number,
        userId: number,
        warehouseId: number,
        warehouseName: string
    ): Promise<void> {
        try {
            const user = await userRepo.findById(userId);
            if (!user) return;

            const result = await checkName(user.firstName, user.lastName);

            await rentalApplicationRepo.updateOfacStatus(applicationId, result.status);

            if (result.status === 'FLAGGED') {
                // Rechazo automático — adminId 0 indica rechazo del sistema
                await rentalApplicationRepo.updateStatus(
                    applicationId,
                    'REJECTED',
                    0,
                    'Solicitud rechazada automáticamente por verificación de listas internacionales de sanciones (OFAC/ONU).'
                );
                notificationService.notifyApplicationFlagged(userId, warehouseName).catch(console.error);
                console.warn(`[RentalApplicationService] ⚠️ Solicitud #${applicationId} rechazada por OFAC — Usuario: ${user.firstName} ${user.lastName}`);
            } else if (result.status === 'ERROR') {
                // No se pudo conectar a las listas — queda para revisión manual del admin
                console.warn(`[RentalApplicationService] ⚠️ OFAC no disponible para solicitud #${applicationId} — revisión manual requerida`);
            }
        } catch (err) {
            console.error(`[RentalApplicationService] ❌ Error en verificación OFAC para solicitud #${applicationId}:`, err);
            await rentalApplicationRepo.updateOfacStatus(applicationId, 'ERROR');
        }
    }
}

export default new RentalApplicationService();
