import express from 'express';
import { env } from './config/env.js';
import sequelize from './config/database.js';
import './models/index.js';
import apiRoutes from './routes/index.js';

import { securityHeaders, corsConfig, rateLimiter } from './middlewares/securityMiddleware.js';

// Crear la app de express
const app = express();

// Middlewares globales
app.use(securityHeaders);
app.use(corsConfig);
app.use('/api', rateLimiter); // Limitar peticiones a las rutas de la API

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api', apiRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// conecta a la base de datos y luego inicia el servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB conectada');


        await sequelize.sync();
        console.log('Tablas sincronizadas');

        app.listen(env.PORT, () => {
            console.log(`Servidor corriendo en puerto ${env.PORT}`);
        });

    } catch (err) {
        console.error('Error al conectar la base de datos', err);
        process.exit(1);
    }
}

startServer();