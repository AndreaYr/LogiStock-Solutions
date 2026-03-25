'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ============================================
    // TABLA: chatbot_features
    // Funcionalidades dinámicas del sistema
    // ============================================
    await queryInterface.createTable('chatbot_features', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50)
        // Valores: 'rentals', 'inventory', 'payments', 'support', 'admin'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER
      },
      requiresAuth: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      minRole: {
        type: Sequelize.STRING(50)
        // Null = todos; 'ADMIN' = solo admins
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // ============================================
    // TABLA: chatbot_conversations
    // Conversaciones con el chatbot
    // ============================================
    await queryInterface.createTable('chatbot_conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'archived', 'deleted'),
        defaultValue: 'active'
      },
      modelUsed: {
        type: Sequelize.STRING(50)
      },
      totalTokens: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalCost: {
        type: Sequelize.DECIMAL(10, 6),
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });

    // ============================================
    // TABLA: chatbot_messages
    // Todos los mensajes en conversación
    // ============================================
    await queryInterface.createTable('chatbot_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'chatbot_conversations', key: 'id' },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('user', 'assistant'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tokensUsed: {
        type: Sequelize.INTEGER
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // ============================================
    // TABLA: chatbot_audit_log
    // Auditoría de llamadas a IA
    // ============================================
    await queryInterface.createTable('chatbot_audit_log', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE'
      },
      conversationId: {
        type: Sequelize.UUID,
        references: { model: 'chatbot_conversations', key: 'id' },
        onDelete: 'SET NULL'
      },
      requestText: {
        type: Sequelize.TEXT
      },
      responseText: {
        type: Sequelize.TEXT
      },
      aiProvider: {
        type: Sequelize.ENUM('openai', 'gemini'),
        defaultValue: 'gemini'
      },
      modelName: {
        type: Sequelize.STRING(100)
      },
      inputTokens: {
        type: Sequelize.INTEGER
      },
      outputTokens: {
        type: Sequelize.INTEGER
      },
      totalCost: {
        type: Sequelize.DECIMAL(10, 6)
      },
      responseTimeMs: {
        type: Sequelize.INTEGER
      },
      statusCode: {
        type: Sequelize.INTEGER
      },
      errorMessage: {
        type: Sequelize.TEXT
      },
      ipAddress: {
        type: Sequelize.INET
      },
      userAgent: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // ============================================
    // ÍNDICES para performance
    // ============================================
    await queryInterface.addIndex('chatbot_features', {
      fields: ['enabled', 'order']
    });

    await queryInterface.addIndex('chatbot_conversations', {
      fields: ['userId', 'status']
    });

    await queryInterface.addIndex('chatbot_conversations', {
      fields: ['createdAt']
    });

    await queryInterface.addIndex('chatbot_messages', {
      fields: ['conversationId', 'createdAt']
    });

    await queryInterface.addIndex('chatbot_messages', {
      fields: ['userId']
    });

    await queryInterface.addIndex('chatbot_audit_log', {
      fields: ['createdAt', 'aiProvider']
    });

    await queryInterface.addIndex('chatbot_audit_log', {
      fields: ['userId']
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chatbot_audit_log');
    await queryInterface.dropTable('chatbot_messages');
    await queryInterface.dropTable('chatbot_conversations');
    await queryInterface.dropTable('chatbot_features');
  }
};
