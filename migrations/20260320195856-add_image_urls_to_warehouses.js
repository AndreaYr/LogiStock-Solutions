'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Agregar columna image_urls para soportar múltiples imágenes
     */
    await queryInterface.addColumn('warehouses', 'image_urls', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array de URLs de imágenes desde diferentes ángulos de la bodega'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Revertir la adición de la columna
     */
    await queryInterface.removeColumn('warehouses', 'image_urls');
  }
};

