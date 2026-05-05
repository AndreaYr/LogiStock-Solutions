/**
 * Asigna ubicaciones internas únicas a todas las bodegas existentes.
 * Estructura: 2 niveles × 5 pasillos × 2 bodegas = 20 combinaciones únicas.
 * Ejecutar una sola vez: npx tsx src/seeds/assignWarehouseLocations.ts
 */

import sequelize from '../config/database.js';
import { Warehouse } from '../models/index.js';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const warehouses = await Warehouse.findAll({ order: [['id', 'ASC']] });
    console.log(`📦 Bodegas encontradas: ${warehouses.length}`);

    // Generar combinaciones únicas suficientes para todos los almacenes
    // 2 niveles × 5 pasillos × 3 bodegas = 30 combinaciones disponibles
    const locations: { nivel: number; pasillo: number; numeroBodega: number }[] = [];
    for (let n = 1; n <= 2; n++) {
      for (let p = 1; p <= 5; p++) {
        for (let b = 1; b <= 3; b++) {
          locations.push({ nivel: n, pasillo: p, numeroBodega: b });
        }
      }
    }

    const shuffled = shuffle(locations);

    for (let i = 0; i < warehouses.length; i++) {
      const loc = shuffled[i];
      await (warehouses[i] as any).update(loc);
      console.log(`✅ ID ${(warehouses[i] as any).id} → Nivel ${loc.nivel} · Pasillo ${loc.pasillo} · Bodega ${loc.numeroBodega}`);
    }

    console.log('\n✅ Ubicaciones asignadas correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

run();
