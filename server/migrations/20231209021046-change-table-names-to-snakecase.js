'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('Variants');
    await queryInterface.dropTable('Experiments');
    await queryInterface.dropTable('Journeys');
    await queryInterface.dropTable('Elements');
    await queryInterface.dropTable('ElementProperties');
    await queryInterface.dropTable('Projects');

    // Create Project table
    await queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      domain: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create ElementProperties table
    await queryInterface.createTable('element_properties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      inner_text: {
        type: Sequelize.STRING,
      },
      font_size: {
        type: Sequelize.STRING,
      },
      color: {
        type: Sequelize.STRING,
      },
      background_color: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Element table
    await queryInterface.createTable('elements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      page: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      selector: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      properties_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'element_properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'projects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Journey table
    await queryInterface.createTable('journeys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      page: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'projects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Experiment table
    await queryInterface.createTable('experiments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      journey_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'journeys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Variant table
    await queryInterface.createTable('variants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      element_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'elements',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      text: {
        type: Sequelize.STRING,
      },
      font_size: {
        type: Sequelize.STRING,
      },
      color: {
        type: Sequelize.STRING,
      },
      background_color: {
        type: Sequelize.STRING,
      },
      experiment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'experiments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
