'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make userId nullable in chatbot_messages table
    await queryInterface.changeColumn('chatbot_messages', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    // Make userId nullable in chatbot_audit_log table (singular)
    await queryInterface.changeColumn('chatbot_audit_log', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert userId to NOT NULL in chatbot_messages
    await queryInterface.changeColumn('chatbot_messages', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    // Revert userId to NOT NULL in chatbot_audit_log table (singular)
    await queryInterface.changeColumn('chatbot_audit_log', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  }
};
