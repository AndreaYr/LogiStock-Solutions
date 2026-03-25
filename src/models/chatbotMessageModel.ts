import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

interface IChatbotMessageAttributes {
  id?: string;
  conversationId: string;
  userId: number | null;
  role: "user" | "assistant";
  content: string;
  tokensUsed?: number | null;
  metadata?: object | null;
  createdAt?: Date;
}

class ChatbotMessage extends Model<IChatbotMessageAttributes, IChatbotMessageAttributes> {
  declare id: string;
  declare conversationId: string;
  declare userId: number | null;
  declare role: "user" | "assistant";
  declare content: string;
  declare tokensUsed: number | null;
  declare metadata: object | null;
  declare readonly createdAt: Date;
}

ChatbotMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Conversación a la que pertenece el mensaje (sin FK para soportar públicas)",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "Usuario que envió o recibió el mensaje (null para chat público)",
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
      comment: "Quién envió el mensaje: usuario o chatbot IA",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Texto del mensaje",
    },
    tokensUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "Tokens consumidos en ESTA respuesta",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: "Metadata adicional: confidence, intent, entities, etc",
    },
  },
  {
    sequelize,
    tableName: "chatbot_messages",
    timestamps: true, // Dejar que Sequelize maneje createdAt automáticamente
    underscored: false,
    indexes: [
      // {
      //   fields: ["conversationId", "createdAt"],
      // },
      {
        fields: ["userId"],
      },
      {
        fields: ["role"],
      },
    ],
  }
);

export default ChatbotMessage;
export type { IChatbotMessageAttributes };
