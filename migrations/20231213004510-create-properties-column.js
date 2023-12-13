'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('elements', 'properties');

    await queryInterface.addColumn('elements', 'properties', {
      type: Sequelize.DataTypes.JSONB,
      allowNull: true,
    });
  },
};
