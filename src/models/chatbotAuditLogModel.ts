import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

interface IChatbotAuditLogAttributes {
  id?: number;
  userId: number | null;
  conversationId?: string | null;
  requestText?: string | null;
  responseText?: string | null;
  aiProvider: "openai" | "gemini";
  modelName?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalCost?: number | null;
  responseTimeMs?: number | null;
  statusCode?: number | null;
  errorMessage?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

class ChatbotAuditLog extends Model<IChatbotAuditLogAttributes, IChatbotAuditLogAttributes> {
  declare id: number;
  declare userId: number | null;
  declare conversationId: string | null;
  declare requestText: string | null;
  declare responseText: string | null;
  declare aiProvider: "openai" | "gemini";
  declare modelName: string | null;
  declare inputTokens: number | null;
  declare outputTokens: number | null;
  declare totalCost: number | null;
  declare responseTimeMs: number | null;
  declare statusCode: number | null;
  declare errorMessage: string | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare readonly createdAt: Date;
}

ChatbotAuditLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "Usuario que hizo la solicitud (null para chat público)",
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      comment: "Conversación asociada (sin FK para soportar públicas)",
    },
    requestText: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Texto del request enviado a la IA",
    },
    responseText: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Texto de la respuesta de la IA",
    },
    aiProvider: {
      type: DataTypes.ENUM("openai", "gemini"),
      allowNull: false,
      defaultValue: "gemini",
      comment: "Proveedor de IA usado",
    },
    modelName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nombre del modelo exacto (gpt-4o, gemini-1.5-pro, etc)",
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Tokens consumidos en input",
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Tokens consumidos en output",
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true,
      comment: "Costo en USD de esta llamada",
    },
    responseTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Tiempo de respuesta en milisegundos",
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "HTTP status code de la respuesta",
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Mensaje de error si falló",
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true,
      comment: "IP del cliente que hizo la solicitud",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "User-Agent del navegador/cliente",
    },
  },
  {
    sequelize,
    tableName: "chatbot_audit_log",
    timestamps: true, // Sequelize maneja createdAt automáticamente
    updatedAt: false, // Solo createdAt para audit logs
    underscored: false,
    indexes: [
      // {
      //   fields: ["createdAt", "aiProvider"],
      // },
      {
        fields: ["userId"],
      },
    ],
  }
);

export default ChatbotAuditLog;
export type { IChatbotAuditLogAttributes };
