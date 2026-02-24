import express from 'express';
import { env } from './config/env.js';
import sequelize from './config/database.js';
import './models';

// Crear la app de express
const  app = express();

//Middleware para leer JSON
app.use(express.json());

//Rutas

// conecta a la base de datos y luego inicia el servidor
const startServer = async () => {
    try{
        await sequelize.authenticate();
        console.log('DB conectada');
        
        await sequelize.sync({
            alter: env.NODE_ENV === 'development'
        })
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