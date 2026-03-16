import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACTS_DIR = path.resolve(__dirname, '../../uploads/contracts');

// Asegura que el directorio exista
if (!fs.existsSync(CONTRACTS_DIR)) {
    fs.mkdirSync(CONTRACTS_DIR, { recursive: true });
}

export interface ContractData {
    applicationId: number;
    // Datos del cliente
    clientName: string;
    clientDocument: string;
    clientDocumentType: string;
    clientPhone: string;
    clientAddress: string;
    clientEmail: string;
    // Datos de la bodega
    warehouseId: number;
    warehouseName: string;
    warehouseAddress: string;
    monthlyPrice: number;
    // Condiciones
    businessActivity: string;
    merchandiseType: string;
    hasDangerousGoods: boolean;
    requiresRefrigeration: boolean;
}

/**
 * Genera el PDF del contrato de arrendamiento.
 * Retorna la ruta relativa del archivo guardado.
 */
export async function generateContractPdf(data: ContractData): Promise<string> {
    const fileName = `contrato_${data.applicationId}_${Date.now()}.pdf`;
    const filePath = path.join(CONTRACTS_DIR, fileName);

    await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        stream.on('finish', resolve);
        stream.on('error', reject);

        const today = new Date().toLocaleDateString('es-CO', {
            day: '2-digit', month: 'long', year: 'numeric',
        });

        // ── Encabezado ──────────────────────────────────────────────────────────
        doc.fontSize(18).font('Helvetica-Bold')
            .text('LOGISTOCK SOLUTIONS S.A.S.', { align: 'center' });
        doc.fontSize(11).font('Helvetica')
            .text('NIT: 901.234.567-8  |  Bogotá D.C., Colombia', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke();
        doc.moveDown(0.5);

        // Título
        doc.fontSize(14).font('Helvetica-Bold')
            .text('CONTRATO DE ARRENDAMIENTO DE BODEGA', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica')
            .text(`Bogotá D.C., ${today}`, { align: 'center' });
        doc.moveDown(1);

        // ── Partes ───────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('PARTES DEL CONTRATO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(
            'ARRENDADOR: LOGISTOCK SOLUTIONS S.A.S., sociedad legalmente constituida bajo ' +
            'las leyes colombianas, con NIT 901.234.567-8, en adelante "EL ARRENDADOR".'
        );
        doc.moveDown(0.5);
        doc.text(
            `ARRENDATARIO: ${data.clientName}, identificado con ${data.clientDocumentType} ` +
            `N.° ${data.clientDocument}, teléfono ${data.clientPhone}, domiciliado en ` +
            `${data.clientAddress}, correo electrónico ${data.clientEmail}, ` +
            'en adelante "EL ARRENDATARIO".'
        );
        doc.moveDown(1);

        // ── Objeto ───────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA PRIMERA — OBJETO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `EL ARRENDADOR entrega en arrendamiento a EL ARRENDATARIO la bodega denominada ` +
            `"${data.warehouseName}", ubicada en ${data.warehouseAddress || 'instalaciones de LogiStock'}, ` +
            `identificada internamente como Bodega #${data.warehouseId}, ` +
            `para ser utilizada exclusivamente en actividades de: ${data.businessActivity}.`
        );
        doc.moveDown(1);

        // ── Precio ───────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SEGUNDA — PRECIO Y FORMA DE PAGO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `El canon mensual de arrendamiento es de COP ${data.monthlyPrice.toLocaleString('es-CO')} ` +
            `(${numToWords(data.monthlyPrice)} pesos colombianos), pagaderos dentro de los primeros ` +
            `cinco (5) días calendario de cada mes a través de la plataforma LogiStock.`
        );
        doc.moveDown(1);

        // ── Duración ────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA TERCERA — DURACIÓN');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            'El presente contrato tendrá una duración inicial de doce (12) meses contados desde ' +
            'la fecha de firma por ambas partes, prorrogable automáticamente por períodos iguales, ' +
            'salvo comunicación en contrario con treinta (30) días de anticipación.'
        );
        doc.moveDown(1);

        // ── Mercancía ────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA CUARTA — USO Y MERCANCÍA');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `EL ARRENDATARIO almacenará únicamente mercancía del tipo: ${data.merchandiseType}. ` +
            `Manejo de materiales peligrosos: ${data.hasDangerousGoods ? 'SÍ (requiere autorización especial)' : 'NO'}. ` +
            `Requiere refrigeración: ${data.requiresRefrigeration ? 'SÍ' : 'NO'}. ` +
            'Queda expresamente prohibido almacenar sustancias ilegales, explosivos o cualquier ' +
            'material no declarado en la solicitud de estudio.'
        );
        doc.moveDown(1);

        // ── Obligaciones ─────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA QUINTA — OBLIGACIONES DE LAS PARTES');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text('El Arrendatario se obliga a:');
        doc.list([
            'Pagar puntualmente el canon de arrendamiento.',
            'Mantener la bodega en buen estado y reportar daños inmediatamente.',
            'No subarrendar ni ceder el contrato sin autorización escrita.',
            'Cumplir con las normas de seguridad y convivencia del complejo.',
            'Permitir inspecciones por parte de LogiStock con previo aviso.',
        ], { bulletRadius: 2, textIndent: 10 });
        doc.moveDown(0.5);
        doc.text('El Arrendador se obliga a:');
        doc.list([
            'Garantizar el acceso continuo a la bodega.',
            'Mantener las áreas comunes y servicios públicos.',
            'Notificar con anticipación cualquier cambio en las condiciones del servicio.',
        ], { bulletRadius: 2, textIndent: 10 });
        doc.moveDown(1);

        // ── Terminación ──────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SEXTA — TERMINACIÓN ANTICIPADA');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            'El incumplimiento de cualquiera de las obligaciones establecidas en este contrato ' +
            'dará derecho a la parte cumplida de solicitar la terminación anticipada, sin perjuicio ' +
            'de las acciones legales y penales a que haya lugar.'
        );
        doc.moveDown(1);

        // ── Legislación ──────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SÉPTIMA — LEGISLACIÓN APLICABLE');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            'El presente contrato se rige por las leyes de la República de Colombia, ' +
            'especialmente el Código Civil y el Código de Comercio. Para cualquier controversia, ' +
            'las partes se someten a los jueces competentes de Bogotá D.C.'
        );
        doc.moveDown(1.5);

        // ── Firmas ───────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('FIRMAS');
        doc.moveDown(1);

        const yFirmas = doc.y;

        // Columna izquierda — Cliente
        doc.fontSize(10).font('Helvetica')
            .text('____________________________', 60, yFirmas)
            .text('EL ARRENDATARIO', 60, yFirmas + 15)
            .text(data.clientName, 60, yFirmas + 28)
            .text(`${data.clientDocumentType} ${data.clientDocument}`, 60, yFirmas + 41);

        // Columna derecha — Admin
        doc.text('____________________________', 320, yFirmas)
            .text('EL ARRENDADOR', 320, yFirmas + 15)
            .text('LOGISTOCK SOLUTIONS S.A.S.', 320, yFirmas + 28)
            .text('Representante Legal', 320, yFirmas + 41);

        doc.moveDown(6);

        // ── Pie de página ────────────────────────────────────────────────────────
        doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(8).font('Helvetica').fillColor('gray')
            .text(
                `Contrato generado electrónicamente por LogiStock Solutions — ${today}`,
                { align: 'center' }
            );

        doc.end();
    });

    return `uploads/contracts/${fileName}`;
}

/** Convierte número a palabras (simplificado para valores hasta 999.999.999) */
function numToWords(n: number): string {
    const millones = Math.floor(n / 1_000_000);
    const miles = Math.floor((n % 1_000_000) / 1_000);
    const resto = n % 1_000;

    let result = '';
    if (millones > 0) result += `${millones} millones `;
    if (miles > 0) result += `${miles} mil `;
    if (resto > 0) result += `${resto}`;
    return result.trim() || 'cero';
}
