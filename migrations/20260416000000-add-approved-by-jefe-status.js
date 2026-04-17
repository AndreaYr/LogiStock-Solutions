'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar el nuevo valor al ENUM de status
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_service_requests_status" ADD VALUE 'APPROVED_BY_JEFE' AFTER 'COMPLETED'`
    );
  },

  async down(queryInterface, Sequelize) {
    // Para revertir, necesitaríamos borrar y recrear el tipo, lo cual es complejo
    // Por ahora dejamos sin down
  }
};
