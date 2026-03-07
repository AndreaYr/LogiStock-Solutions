/**
 * Modelo Sequelize para la tabla "roles"
 * Define los roles disponibles en el sistema logistock:
 * - Administrador: Acceso total a todas las funcionalidades y datos.
 * - Jefe de Almacén: Gestión de inventarios, pedidos y reportes.
 * - Operador: Manejo de operaciones diarias, como escaneo de productos y actualización de stock.
 * - Cliente: Acceso a su propio historial y estado de inventarios.
 */

import { DataTypes, Model} from "sequelize";
import sequelize from "../config/database.js";
import {IRole, IRoleAttributes, IRoleCreationAttributes, UserRole} from "../interfaces/interfaces.js";

class Role extends Model<IRoleAttributes, IRoleCreationAttributes> implements IRole{
    declare id: number;
    declare name: UserRole
    declare description: string | null; 
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

// Iniciamos el modelo con sus atributos y opciones
Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: { // Nombre del rol, debe ser uno de los valores definidos en el enum UserRole
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            comment: 'Nombre unico del rol ',
        },

        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            comment: 'Descripción de las responsabilidades del rol',
        },
    },
    {
        sequelize,          // Instancia de conexión a la base de datos
        tableName: 'roles', // Nombre de la tabla en la base de datos
        modelName: 'Role',  // Nombre del modelo en Sequelize
        timestamps: true,   // Agrega createdAt y updatedAt automáticamente
        underscored: true,  // Usa snake_case para los nombres de columnas
        comment: 'Tabla que define los roles de usuario en el sistema',
        // unique se define aquí para evitar SQL inválido en PostgreSQL con ENUM + alter:true
        indexes: [
            { unique: true, fields: ['name'] }
        ],
    }
);

export default Role;