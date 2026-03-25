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

export interface SignedContractData extends ContractData {
    clientSignaturePath: string;
    documentPhotoPath: string;
    documentPhotoBackPath: string;
    adminSignaturePath: string;
    clientSignedAt: Date;
    adminSignedAt: Date;
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
    rentalDuration: 'MONTHLY' | 'SEMESTER' | 'ANNUAL';
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
        const durationMonths = data.rentalDuration === 'ANNUAL' ? 12 : data.rentalDuration === 'SEMESTER' ? 6 : 1;
        const totalPrice = data.monthlyPrice * durationMonths;

        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SEGUNDA — PRECIO Y FORMA DE PAGO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `El canon mensual de arrendamiento es de COP ${data.monthlyPrice.toLocaleString('es-CO')} ` +
            `(${numToWords(data.monthlyPrice)} pesos colombianos). ` +
            `El valor total del período contratado es de COP ${totalPrice.toLocaleString('es-CO')} ` +
            `(${numToWords(totalPrice)} pesos colombianos), pagadero a través de la plataforma LogiStock.`
        );
        doc.moveDown(1);

        // ── Duración ────────────────────────────────────────────────────────────
        const durationLabel = data.rentalDuration === 'ANNUAL'
            ? 'doce (12) meses'
            : data.rentalDuration === 'SEMESTER'
            ? 'seis (6) meses'
            : 'un (1) mes';

        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA TERCERA — DURACIÓN');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `El presente contrato tendrá una duración de ${durationLabel} contados desde ` +
            'la fecha de firma por ambas partes, prorrogable de mutuo acuerdo, ' +
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

/**
 * Genera el PDF final del contrato con las firmas e imágenes de cédula embebidas.
 * Se llama cuando el admin firma — reemplaza el PDF borrador.
 */
export async function generateSignedContractPdf(data: SignedContractData): Promise<string> {
    const fileName = `contrato_${data.applicationId}_signed_${Date.now()}.pdf`;
    const filePath = path.join(CONTRACTS_DIR, fileName);

    const fmtDate = (d: Date) =>
        d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

    await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        stream.on('finish', resolve);
        stream.on('error', reject);

        const today = fmtDate(data.adminSignedAt);

        // ── Encabezado ──────────────────────────────────────────────────────────
        doc.fontSize(18).font('Helvetica-Bold')
            .text('LOGISTOCK SOLUTIONS S.A.S.', { align: 'center' });
        doc.fontSize(11).font('Helvetica')
            .text('NIT: 901.234.567-8  |  Bogotá D.C., Colombia', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke();
        doc.moveDown(0.5);

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

        // ── Cláusulas ────────────────────────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA PRIMERA — OBJETO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `EL ARRENDADOR entrega en arrendamiento a EL ARRENDATARIO la bodega denominada ` +
            `"${data.warehouseName}", ubicada en ${data.warehouseAddress || 'instalaciones de LogiStock'}, ` +
            `identificada internamente como Bodega #${data.warehouseId}, ` +
            `para ser utilizada exclusivamente en actividades de: ${data.businessActivity}.`
        );
        doc.moveDown(1);

        const durationMonths2 = data.rentalDuration === 'ANNUAL' ? 12 : data.rentalDuration === 'SEMESTER' ? 6 : 1;
        const totalPrice2 = data.monthlyPrice * durationMonths2;

        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SEGUNDA — PRECIO Y FORMA DE PAGO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `El canon mensual de arrendamiento es de COP ${data.monthlyPrice.toLocaleString('es-CO')} ` +
            `(${numToWords(data.monthlyPrice)} pesos colombianos). ` +
            `El valor total del período contratado es de COP ${totalPrice2.toLocaleString('es-CO')} ` +
            `(${numToWords(totalPrice2)} pesos colombianos), pagadero a través de la plataforma LogiStock.`
        );
        doc.moveDown(1);

        const durationLabel2 = data.rentalDuration === 'ANNUAL'
            ? 'doce (12) meses'
            : data.rentalDuration === 'SEMESTER'
            ? 'seis (6) meses'
            : 'un (1) mes';

        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA TERCERA — DURACIÓN');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            `El presente contrato tendrá una duración de ${durationLabel2} contados desde ` +
            'la fecha de firma por ambas partes, prorrogable de mutuo acuerdo, ' +
            'salvo comunicación en contrario con treinta (30) días de anticipación.'
        );
        doc.moveDown(1);

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

        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SEXTA — TERMINACIÓN ANTICIPADA');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            'El incumplimiento de cualquiera de las obligaciones establecidas en este contrato ' +
            'dará derecho a la parte cumplida de solicitar la terminación anticipada, sin perjuicio ' +
            'de las acciones legales y penales a que haya lugar.'
        );
        doc.moveDown(1);

        doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULA SÉPTIMA — LEGISLACIÓN APLICABLE');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
            'El presente contrato se rige por las leyes de la República de Colombia, ' +
            'especialmente el Código Civil y el Código de Comercio. Para cualquier controversia, ' +
            'las partes se someten a los jueces competentes de Bogotá D.C.'
        );
        doc.moveDown(1.5);

        // ── Firmas con imágenes embebidas ─────────────────────────────────────────
        doc.fontSize(12).font('Helvetica-Bold').text('FIRMAS');
        doc.moveDown(0.8);

        const sigY = doc.y;
        const sigW = 150;
        const sigH = 60;

        // Firma cliente (izquierda)
        doc.fontSize(9).font('Helvetica').fillColor('gray')
            .text('Firma del Arrendatario:', 60, sigY);
        try {
            doc.image(data.clientSignaturePath, 60, sigY + 14, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch { /* si la imagen no se puede cargar, dejamos espacio */ }
        doc.fillColor('black').fontSize(9).font('Helvetica')
            .text(data.clientName, 60, sigY + 80)
            .text(`${data.clientDocumentType} ${data.clientDocument}`, 60, sigY + 92)
            .text(`Firmado: ${fmtDate(data.clientSignedAt)}`, 60, sigY + 104);

        // Firma admin (derecha)
        doc.fontSize(9).font('Helvetica').fillColor('gray')
            .text('Firma del Arrendador:', 330, sigY);
        try {
            doc.image(data.adminSignaturePath, 330, sigY + 14, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch { /* espacio vacío */ }
        doc.fillColor('black').fontSize(9).font('Helvetica')
            .text('LOGISTOCK SOLUTIONS S.A.S.', 330, sigY + 80)
            .text('Representante Legal', 330, sigY + 92)
            .text(`Firmado: ${fmtDate(data.adminSignedAt)}`, 330, sigY + 104);

        doc.moveDown(8);

        // ── Documentos de identidad ───────────────────────────────────────────────
        doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold').text('DOCUMENTOS DE IDENTIDAD DEL ARRENDATARIO');
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').fillColor('gray')
            .text('Las siguientes imágenes fueron adjuntadas por el arrendatario al momento de la firma digital.');
        doc.fillColor('black');
        doc.moveDown(1);

        const photoW = 210;
        const photoH = 130;
        const photoY = doc.y;

        // Frente
        doc.fontSize(10).font('Helvetica-Bold').text('Frente de la cédula:', 60, photoY);
        try {
            doc.image(data.documentPhotoPath, 60, photoY + 16, { width: photoW, height: photoH, fit: [photoW, photoH] });
        } catch { doc.rect(60, photoY + 16, photoW, photoH).stroke(); }

        // Reverso
        doc.fontSize(10).font('Helvetica-Bold').text('Reverso de la cédula:', 300, photoY);
        try {
            doc.image(data.documentPhotoBackPath, 300, photoY + 16, { width: photoW, height: photoH, fit: [photoW, photoH] });
        } catch { doc.rect(300, photoY + 16, photoW, photoH).stroke(); }

        doc.moveDown(11);

        // ── Pie de página ─────────────────────────────────────────────────────────
        doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(8).font('Helvetica').fillColor('gray')
            .text(
                `Contrato sellado electrónicamente por LogiStock Solutions — ${today}`,
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
