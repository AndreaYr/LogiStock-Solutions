//Archivo que lee las variables del .env y las exporta tipadas
import dotenv from 'dotenv'

dotenv.config();

export const env = {
    //Server
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(','),
    APP_URL: process.env.APP_URL || 'http://localhost:3000',

    //Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME || 'logistock-db',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    //JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,

    // PASARELA DE PAGO
    WOMPI_PUBLIC_KEY: process.env.WOMPI_PUBLIC_KEY || 'pub_test_KNdmFPNZq1JjKmVmpJkABrX1mYujfHG1',
    WOMPI_PRIVATE_KEY: process.env.WOMPI_PRIVATE_KEY || 'prv_test_nxW2ZTxSxST2Ml1tlt20BXPlC2VbyAwO',
    WOMPI_INTEGRITY_SECRET: process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_7rpwUDeBhSd4ecYePRnNHXUY0YtLgEDa',
    WOMPI_EVENTS_SECRET: process.env.WOMPI_EVENTS_SECRET || 'test_events_egodi8LzBEm4OorHa8d2YUegz6raZBYd',

    // EMAIL (Resend)
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'LogiStock <noreply@logistock.com>',
    APP_URL: process.env.APP_URL || 'http://localhost:3000',

}

