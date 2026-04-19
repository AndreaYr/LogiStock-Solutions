'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── user_audit_log ──────────────────────────────────────────────────────
    await queryInterface.createTable('user_audit_log', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      changed_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING(60), allowNull: false },
      changes: { type: Sequelize.JSONB, allowNull: true },
      reason: { type: Sequelize.STRING(500), allowNull: true },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ── service_request_audit_log ───────────────────────────────────────────
    await queryInterface.createTable('service_request_audit_log', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      request_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'service_requests', key: 'id' }, onDelete: 'SET NULL' },
      changed_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING(60), allowNull: false },
      previous_status: { type: Sequelize.STRING(50), allowNull: true },
      new_status: { type: Sequelize.STRING(50), allowNull: true },
      reason: { type: Sequelize.STRING(500), allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ── warehouse_audit_log ─────────────────────────────────────────────────
    await queryInterface.createTable('warehouse_audit_log', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      warehouse_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'warehouses', key: 'id' }, onDelete: 'SET NULL' },
      changed_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING(60), allowNull: false },
      changes: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ── novelty_audit_log ───────────────────────────────────────────────────
    await queryInterface.createTable('novelty_audit_log', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      novelty_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'novelties', key: 'id' }, onDelete: 'SET NULL' },
      changed_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING(60), allowNull: false },
      previous_status: { type: Sequelize.STRING(50), allowNull: true },
      new_status: { type: Sequelize.STRING(50), allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ── report_access_log ───────────────────────────────────────────────────
    await queryInterface.createTable('report_access_log', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      report_type: { type: Sequelize.STRING(100), allowNull: false },
      params: { type: Sequelize.JSONB, allowNull: true },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('report_access_log');
    await queryInterface.dropTable('novelty_audit_log');
    await queryInterface.dropTable('warehouse_audit_log');
    await queryInterface.dropTable('service_request_audit_log');
    await queryInterface.dropTable('user_audit_log');
  },
};
