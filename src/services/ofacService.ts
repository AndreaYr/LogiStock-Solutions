/**
 * Servicio de verificación contra listas de sanciones internacionales.
 * Consulta la lista consolidada OFAC (Tesoro de EEUU) y la lista de la ONU.
 * La lista se cachea en memoria y se refresca cada 24 horas.
 */

import https from 'https';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface OfacCheckResult {
    status: 'CLEAR' | 'FLAGGED' | 'ERROR';
    matches: string[];
}

interface SanctionedEntry {
    fullName: string;
}

// ─── Caché en memoria ─────────────────────────────────────────────────────────

let sanctionsList: SanctionedEntry[] = [];
let lastFetched: Date | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

// ─── URLs de las listas ───────────────────────────────────────────────────────

const OFAC_URL =
    'https://www.treasury.gov/ofac/downloads/consolidated/consolidated.xml';

const UN_URL =
    'https://scsanctions.un.org/resources/xml/en/consolidated.xml';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Descarga el contenido de una URL como texto */
function fetchText(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => resolve(data));
            })
            .on('error', reject);
    });
}

/** Extrae nombres de la lista OFAC (XML del Tesoro de EEUU) */
function parseOfacXml(xml: string): SanctionedEntry[] {
    const entries: SanctionedEntry[] = [];
    // Busca bloques <sdnEntry> y extrae firstName + lastName
    const sdnRegex = /<sdnEntry>([\s\S]*?)<\/sdnEntry>/g;
    const firstNameRegex = /<firstName>(.*?)<\/firstName>/;
    const lastNameRegex = /<lastName>(.*?)<\/lastName>/;

    let match: RegExpExecArray | null;
    while ((match = sdnRegex.exec(xml)) !== null) {
        const block = match[1];
        const firstName = firstNameRegex.exec(block)?.[1]?.trim() ?? '';
        const lastName = lastNameRegex.exec(block)?.[1]?.trim() ?? '';
        if (lastName) {
            entries.push({ fullName: `${firstName} ${lastName}`.trim().toUpperCase() });
        }
    }
    return entries;
}

/** Extrae nombres de la lista consolidada de la ONU (XML) */
function parseUnXml(xml: string): SanctionedEntry[] {
    const entries: SanctionedEntry[] = [];
    // Busca bloques <INDIVIDUAL> y extrae FIRST_NAME + SECOND_NAME + THIRD_NAME
    const indRegex = /<INDIVIDUAL>([\s\S]*?)<\/INDIVIDUAL>/g;
    const firstRegex = /<FIRST_NAME>(.*?)<\/FIRST_NAME>/;
    const secondRegex = /<SECOND_NAME>(.*?)<\/SECOND_NAME>/;
    const thirdRegex = /<THIRD_NAME>(.*?)<\/THIRD_NAME>/;

    let match: RegExpExecArray | null;
    while ((match = indRegex.exec(xml)) !== null) {
        const block = match[1];
        const first = firstRegex.exec(block)?.[1]?.trim() ?? '';
        const second = secondRegex.exec(block)?.[1]?.trim() ?? '';
        const third = thirdRegex.exec(block)?.[1]?.trim() ?? '';
        const fullName = [first, second, third].filter(Boolean).join(' ').toUpperCase();
        if (fullName) entries.push({ fullName });
    }
    return entries;
}

/** Normaliza un texto: quita tildes, espacios extra y convierte a mayúsculas */
function normalize(text: string): string {
    return text
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ─── Carga y refresco de la lista ─────────────────────────────────────────────

async function loadSanctionsList(): Promise<void> {
    const now = new Date();
    const needsRefresh =
        !lastFetched || now.getTime() - lastFetched.getTime() > CACHE_TTL_MS;

    if (!needsRefresh) return;

    console.log('[OfacService] Descargando listas de sanciones OFAC + ONU...');

    const results: SanctionedEntry[] = [];

    // OFAC
    try {
        const ofacXml = await fetchText(OFAC_URL);
        const ofacEntries = parseOfacXml(ofacXml);
        results.push(...ofacEntries);
        console.log(`[OfacService] ✅ OFAC: ${ofacEntries.length} entradas cargadas`);
    } catch (err) {
        console.error('[OfacService] ⚠️ Error descargando lista OFAC:', err);
    }

    // ONU
    try {
        const unXml = await fetchText(UN_URL);
        const unEntries = parseUnXml(unXml);
        results.push(...unEntries);
        console.log(`[OfacService] ✅ ONU: ${unEntries.length} entradas cargadas`);
    } catch (err) {
        console.error('[OfacService] ⚠️ Error descargando lista ONU:', err);
    }

    if (results.length > 0) {
        sanctionsList = results;
        lastFetched = now;
        console.log(`[OfacService] ✅ Total en lista: ${sanctionsList.length} entradas`);
    } else {
        console.error('[OfacService] ❌ No se pudo cargar ninguna lista de sanciones');
    }
}

// ─── Método principal ─────────────────────────────────────────────────────────

/**
 * Verifica si un nombre aparece en las listas OFAC/ONU.
 * @param firstName Nombre del solicitante
 * @param lastName Apellido del solicitante
 */
export async function checkName(
    firstName: string,
    lastName: string
): Promise<OfacCheckResult> {
    try {
        await loadSanctionsList();

        if (sanctionsList.length === 0) {
            console.warn('[OfacService] Lista vacía, no se puede verificar');
            return { status: 'ERROR', matches: [] };
        }

        const fullName = normalize(`${firstName} ${lastName}`);
        const matches: string[] = [];

        for (const entry of sanctionsList) {
            const entryName = normalize(entry.fullName);

            // Coincidencia exacta o el nombre del solicitante está contenido en la entrada
            if (entryName === fullName || entryName.includes(fullName)) {
                matches.push(entry.fullName);
            }
        }

        return {
            status: matches.length > 0 ? 'FLAGGED' : 'CLEAR',
            matches,
        };
    } catch (err) {
        console.error('[OfacService] ❌ Error en verificación OFAC:', err);
        return { status: 'ERROR', matches: [] };
    }
}

export default { checkName };
