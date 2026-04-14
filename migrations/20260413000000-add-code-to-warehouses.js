'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('warehouses', 'code', {
      type: Sequelize.STRING(6),
      allowNull: true,      // temporal — se rellena con el script y luego se pone NOT NULL
      unique: true,
      comment: 'Código único de 6 dígitos generado automáticamente al crear la bodega',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('warehouses', 'code');
  },
};
