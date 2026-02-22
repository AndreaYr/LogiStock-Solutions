import express from 'express';
import { env } from './config/env.js';
import sequelize from './config/database.js';

// Crear la app de express
const  app = express();

//Middleware para leer JSON
app.use(express.json());

//Rutas

//Conecta base de datos y levantar servidos
sequelize.authenticate()
    .then(() => {
        console.log('DB conectada');
        app.listen(env.PORT, () => {
        console.log(`Servidor corriendo en puerto ${env.PORT}`);
    });
})
.catch((err) => {
    console.error('Error al conectar la base de datos', err);
    process.exit(1);
})