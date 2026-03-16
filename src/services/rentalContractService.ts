import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import rentalContractRepo from '../repositories/rentalContractRepositories.js';
import rentalApplicationRepo from '../repositories/rentalApplicationRepositories.js';
import { UserRepository } from '../repositories/userRepositories.js';
import { WarehouseRepository } from '../repositories/warehouseRepositories.js';
import { generateContractPdf } from './pdfService.js';
import notificationService from './notificationService.js';
import RentalContract from '../models/rentalContractModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIGNATURES_DIR = path.resolve(__dirname, '../../uploads/signatures');

if (!fs.existsSync(SIGNATURES_DIR)) {
    fs.mkdirSync(SIGNATURES_DIR, { recursive: true });
}

const userRepo = new UserRepository();
const warehouseRepo = new WarehouseRepository();

class RentalContractService {

    /**
     * Genera el contrato PDF automáticamente al aprobar la solicitud.
     * Crea el registro con status PENDING_CLIENT.
     */
    async generateForApplication(applicationId: number): Promise<RentalContract> {
        const application = await rentalApplicationRepo.findById(applicationId);
        if (!application) throw new Error('Solicitud no encontrada.');
        if (application.status !== 'APPROVED') {
            throw new Error('Solo se puede generar contrato para solicitudes APPROVED.');
        }

        const existing = await rentalContractRepo.findByApplicationId(applicationId);
        if (existing) throw new Error('Ya existe un contrato para esta solicitud.');

        const user = await userRepo.findById(application.userId);
        if (!user) throw new Error('Usuario no encontrado.');

        const warehouse = await warehouseRepo.findById(application.warehouseId);
        if (!warehouse) throw new Error('Bodega no encontrada.');

        const contractPdfPath = await generateContractPdf({
            applicationId,
            clientName: `${user.firstName} ${user.lastName}`,
            clientDocument: application.documentNumber,
            clientDocumentType: application.documentType,
            clientPhone: application.phone,
            clientAddress: application.address,
            clientEmail: user.email,
            warehouseId: warehouse.id,
            warehouseName: (warehouse as any).description ?? `Bodega #${warehouse.id}`,
            warehouseAddress: (warehouse as any).address ?? '',
            monthlyPrice: (warehouse as any).monthlyPrice ?? 0,
            businessActivity: application.businessActivity,
            merchandiseType: application.merchandiseType,
            hasDangerousGoods: application.hasDangerousGoods,
            requiresRefrigeration: application.requiresRefrigeration,
        });

        const contract = await rentalContractRepo.create({
            applicationId,
            userId: application.userId,
            warehouseId: application.warehouseId,
            contractPdfPath,
            status: 'PENDING_CLIENT',
        });

        notificationService.create(
            application.userId,
            'application_approved',
            '¡Tu contrato está listo para firmar!',
            '¡Tu contrato está listo! Ingresa a "Mis Solicitudes" para firmarlo.'
        ).catch(console.error);

        return contract;
    }

    /**
     * El cliente sube foto de cédula y firma (base64).
     * Guarda los archivos y pasa el contrato a PENDING_ADMIN.
     */
    async clientSign(
        contractId: number,
        userId: number,
        signatureBase64: string,
        documentPhotoBase64: string
    ): Promise<void> {
        const contract = await rentalContractRepo.findById(contractId);
        if (!contract) throw new Error('Contrato no encontrado.');
        if (contract.userId !== userId) throw new Error('No tienes permiso para firmar este contrato.');
        if (contract.status !== 'PENDING_CLIENT') {
            throw new Error('El contrato no está en estado PENDING_CLIENT.');
        }

        const signaturePath = await this._saveBase64Image(
            signatureBase64,
            `signature_client_${contractId}_${Date.now()}.png`
        );
        const documentPhotoPath = await this._saveBase64Image(
            documentPhotoBase64,
            `cedula_${contractId}_${Date.now()}.png`
        );

        await rentalContractRepo.saveClientSignature(contractId, signaturePath, documentPhotoPath);

        // Notificar al admin
        notificationService.notifyAllAdmins(
            'application_submitted',
            'Contrato pendiente de tu firma',
            `El cliente firmó el contrato #${contractId}. Requiere tu firma.`
        ).catch(console.error);
    }

    /**
     * El admin firma el contrato.
     * Genera hash SHA-256 y sella el contrato como SIGNED.
     */
    async adminSign(contractId: number, signatureBase64: string): Promise<void> {
        const contract = await rentalContractRepo.findById(contractId);
        if (!contract) throw new Error('Contrato no encontrado.');
        if (contract.status !== 'PENDING_ADMIN') {
            throw new Error('El contrato no está en estado PENDING_ADMIN.');
        }

        const signaturePath = await this._saveBase64Image(
            signatureBase64,
            `signature_admin_${contractId}_${Date.now()}.png`
        );

        // Hash SHA-256 del archivo PDF del contrato
        const contractHash = await this._hashFile(contract.contractPdfPath);

        await rentalContractRepo.saveAdminSignature(contractId, signaturePath, contractHash);

        // Notificar al cliente
        notificationService.create(
            contract.userId,
            'application_approved',
            '¡Contrato vigente!',
            '¡Tu contrato ha sido firmado por ambas partes y está vigente!'
        ).catch(console.error);
    }

    async getByUser(userId: number): Promise<RentalContract[]> {
        return rentalContractRepo.findByUserId(userId);
    }

    async getAll(): Promise<RentalContract[]> {
        return rentalContractRepo.findAll();
    }

    async getById(contractId: number): Promise<RentalContract> {
        const contract = await rentalContractRepo.findById(contractId);
        if (!contract) throw new Error('Contrato no encontrado.');
        return contract;
    }

    async getPendingAdmin(): Promise<RentalContract[]> {
        return rentalContractRepo.findPendingAdmin();
    }

    // ── Privados ───────────────────────────────────────────────────────────────

    private async _saveBase64Image(base64: string, fileName: string): Promise<string> {
        // Elimina el prefijo data:image/...;base64, si existe
        const data = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(data, 'base64');
        const filePath = path.join(SIGNATURES_DIR, fileName);
        await fs.promises.writeFile(filePath, buffer);
        return `uploads/signatures/${fileName}`;
    }

    private async _hashFile(relativePath: string): Promise<string> {
        const absPath = path.resolve(__dirname, '../../', relativePath);
        const fileBuffer = await fs.promises.readFile(absPath);
        return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }
}

export default new RentalContractService();
