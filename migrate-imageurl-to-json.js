import sequelize from './src/config/database.js';

const migrateImageUrl = async () => {
  try {
    console.log('⏳ Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.\n');

    console.log('🔄 Migrando columna imageUrl a JSON...\n');

    // 1. Eliminar la columna image_urls si existe
    console.log('   - Eliminando columna image_urls (si existe)...');
    await sequelize.query('ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "image_urls"');

    // 2. Eliminar la columna image_url actual
    console.log('   - Eliminando columna image_url actual...');
    await sequelize.query('ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "image_url"');

    // 3. Crear la nueva columna image_url como JSON
    console.log('   - Creando nueva columna image_url como JSON...');
    await sequelize.query(
      `ALTER TABLE "warehouses" ADD COLUMN "image_url" JSON DEFAULT NULL`
    );

    // 4. Agregar comentario
    console.log('   - Agregando comentario...');
    await sequelize.query(
      `COMMENT ON COLUMN "warehouses"."image_url" IS 'Array de URLs de imágenes para carrusel (3-4 imágenes por bodega)'`
    );

    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

migrateImageUrl();
