
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
};

console.log('Probando conexión sin SSL a:', config.host);

const client = new pg.Client(config);

try {
    await client.connect();
    console.log('✅ Conexión exitosa SIN SSL');
    await client.end();
} catch (err) {
    console.error('❌ Error sin SSL:', err.message);

    console.log('\nProbando conexión CON SSL...');
    const clientSSL = new pg.Client({
        ...config,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await clientSSL.connect();
        console.log('✅ Conexión exitosa CON SSL');
        await clientSSL.end();
    } catch (err2) {
        console.error('❌ Error con SSL:', err2.message);
    }
}
