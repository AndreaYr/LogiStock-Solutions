import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

interface IChatbotConversationAttributes {
  id?: string;
  userId: number;
  title?: string | null;
  status?: "active" | "archived" | "deleted";
  modelUsed?: string | null;
  totalTokens?: number;
  totalCost?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

class ChatbotConversation extends Model<IChatbotConversationAttributes, IChatbotConversationAttributes> {
  declare id: string;
  declare userId: number;
  declare title: string | null;
  declare status: "active" | "archived" | "deleted";
  declare modelUsed: string | null;
  declare totalTokens: number;
  declare totalCost: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;
}

ChatbotConversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "Usuario propietario de la conversación",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment: "Título auto-generado o user-provided",
    },
    status: {
      type: DataTypes.ENUM("active", "archived", "deleted"),
      defaultValue: "active",
      comment: "Estado de la conversación",
    },
    modelUsed: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "gemini-1.5-pro",
      comment: "Modelo de IA usado (gpt-4o, gemini-1.5-pro, etc)",
    },
    totalTokens: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Total de tokens consumidos en la conversación",
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 6),
      defaultValue: 0,
      comment: "Costo total en USD",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: "Soft delete timestamp",
    },
  },
  {
    sequelize,
    tableName: "chatbot_conversations",
    timestamps: true, // Sequelize maneja createdAt/updatedAt automáticamente
    paranoid: false, // No usar soft delete automático aquí
    underscored: false,
    indexes: [
      {
        fields: ["userId", "status"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default ChatbotConversation;
export type { IChatbotConversationAttributes };
