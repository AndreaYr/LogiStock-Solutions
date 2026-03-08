import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface que define todos los atributos de la tabla Bodega
export interface IBodegaAttributes {
    id: number;
    descripcion: string;
    capacidadOcupado: number;
    direccion: string | null;
    codigoPostal: string | null;
    largoAlmacenamiento: number | null;
    anchoAlmacenamiento: number | null;
    altoAlmacenamiento: number | null;
    imagenUrl: string | null;
}

// Interface para creación (id opcional generado por DB)
export interface IBodegaCreationAttributes extends Optional<IBodegaAttributes, 'id' | 'largoAlmacenamiento' | 'anchoAlmacenamiento' | 'altoAlmacenamiento' | 'codigoPostal' | 'direccion' | 'imagenUrl'> { }

// Interface Final del Modelo
export interface IBodega extends Model<IBodegaAttributes, IBodegaCreationAttributes>, IBodegaAttributes { }

class Bodega extends Model<IBodegaAttributes, IBodegaCreationAttributes> implements IBodega {
    declare id: number;
    declare descripcion: string;
    declare capacidadOcupado: number;
    declare direccion: string | null;
    declare codigoPostal: string | null;
    declare largoAlmacenamiento: number | null;
    declare anchoAlmacenamiento: number | null;
    declare altoAlmacenamiento: number | null;
    declare imagenUrl: string | null;
}

Bodega.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    descripcion: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    capacidadOcupado: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },
    direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    codigoPostal: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    largoAlmacenamiento: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    anchoAlmacenamiento: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    altoAlmacenamiento: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    imagenUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Bodega',
    tableName: 'bodegas', // Nombre explícito según estándares plurales
    timestamps: false,    // No se observa timestamps explícitos en el DER para Bodega
});

export default Bodega;
