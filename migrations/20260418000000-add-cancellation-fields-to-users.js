'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'cancellation_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Fecha en que el usuario canceló su suscripción. Null = activo.',
    });

    await queryInterface.addColumn('users', 'is_anonymized', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'True cuando los datos del usuario fueron anonimizados definitivamente.',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'cancellation_date');
    await queryInterface.removeColumn('users', 'is_anonymized');
  },
};
