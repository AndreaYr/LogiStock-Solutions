'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rentals', 'warehouse_code', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('rentals', 'warehouse_code');
  },
};
