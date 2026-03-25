import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import sequelize from './config/database.js';
import './models/index.js';
import apiRoutes from './routes/index.js';

import { securityHeaders, corsConfig, rateLimiter } from './middlewares/securityMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Crear la app de express
const app = express();

// Middlewares globales
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(securityHeaders);
app.use(corsConfig);
app.use('/api', rateLimiter); // Limitar peticiones a las rutas de la API

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos — firmas, fotos cédula, contratos PDF
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Rutas API
app.use('/api', apiRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// conecta a la base de datos y luego inicia el servidor
const startServer = async () => {
    try {
        console.log('Intentando conectar con la base de datos...');
        await sequelize.authenticate();
        console.log('✅ DB conectada');

        // In development, use alter:true to modify column constraints
        // In production, use migrations instead
        // NOTE: Disabled due to issues with ENUM column changes
        // const shouldAlter = env.NODE_ENV === 'development';
        await sequelize.sync({ alter: false, force: false });
        console.log('✅ Tablas sincronizadas');

        app.listen(env.PORT, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${env.PORT}`);
        });

    } catch (err) {
        console.error('❌ Error crítico al iniciar el servidor:');
        console.error(err);
        process.exit(1);
    }
}

// Capturar errores no manejados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();