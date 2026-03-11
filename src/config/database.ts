import { Sequelize } from "sequelize";
import { env } from './env.js';
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASS,
    logging: env.NODE_ENV === 'development' ? console.log: false,
    define: {
        timestamps: true,
        underscored: true,
    },
    dialectOptions: {
        ssl: env.DB_SSL ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    retry: {
        max: 3
    }
});
export default sequelize;
