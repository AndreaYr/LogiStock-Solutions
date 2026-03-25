import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

interface IChatbotFeatureAttributes {
  id?: number;
  name: string;
  description: string;
  category?: string;
  enabled?: boolean;
  order?: number;
  requiresAuth?: boolean;
  minRole?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class ChatbotFeature extends Model<IChatbotFeatureAttributes, IChatbotFeatureAttributes> {
  declare id: number;
  declare name: string;
  declare description: string;
  declare category?: string;
  declare enabled: boolean;
  declare order?: number;
  declare requiresAuth: boolean;
  declare minRole: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ChatbotFeature.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nombre de la funcionalidad (ej: Alquilar bodega)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Descripción detallada de qué hace la funcionalidad",
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Categoría: rentals, inventory, payments, support, admin",
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "¿Está habilitada para aparecer en el chatbot?",
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Orden de aparición en el system prompt",
    },
    requiresAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "¿Requiere autenticación para verla?",
    },
    minRole: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      comment: "Rol mínimo requerido (null = todos)",
    },
  },
  {
    sequelize,
    tableName: "chatbot_features",
    timestamps: true,
    underscored: false,
  }
);

export default ChatbotFeature;
export type { IChatbotFeatureAttributes };
