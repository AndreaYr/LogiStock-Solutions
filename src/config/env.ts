//Archivo que lee las variables del .env y las exporta tipadas
import dotenv from 'dotenv'

dotenv.config();

export const env = {
    //Server
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(','),
    APP_URL: process.env.APP_URL || 'http://localhost:8080',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',

    //Database
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASSWORD,
    DB_SSL:  process.env.DB_SSL === 'true',

    //JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,

    // PASARELA DE PAGO — PRODUCCIÓN
    WOMPI_PUBLIC_KEY:        process.env.WOMPI_PUBLIC_KEY || '',
    WOMPI_PRIVATE_KEY:       process.env.WOMPI_PRIVATE_KEY || '',
    WOMPI_INTEGRITY_SECRET:  process.env.WOMPI_INTEGRITY_SECRET || '',
    WOMPI_EVENTS_SECRET:     process.env.WOMPI_EVENTS_SECRET || '',

    // PASARELA DE PAGO — TEST / SANDBOX
    WOMPI_TEST_PUBLIC_KEY:        process.env.WOMPI_TEST_PUBLIC_KEY || 'pub_test_KNdmFPNZq1JjKmVmpJkABrX1mYujfHG1',
    WOMPI_TEST_PRIVATE_KEY:       process.env.WOMPI_TEST_PRIVATE_KEY || 'prv_test_nxW2ZTxSxST2Ml1tlt20BXPlC2VbyAwO',
    WOMPI_TEST_INTEGRITY_SECRET:  process.env.WOMPI_TEST_INTEGRITY_SECRET || 'test_integrity_7rpwUDeBhSd4ecYePRnNHXUY0YtLgEDa',
    WOMPI_TEST_EVENTS_SECRET:     process.env.WOMPI_TEST_EVENTS_SECRET || 'test_events_egodi8LzBEm4OorHa8d2YUegz6raZBYd',

    // EMAIL (SMTP - Nodemailer)
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '465', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'LogiStock <tu-correo@gmail.com>',

}

