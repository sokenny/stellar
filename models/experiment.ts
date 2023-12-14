import { Model, DataTypes, Sequelize } from 'sequelize';

class Experiment extends Model {
  public id!: number;
  public name!: string;
  public start_date!: Date;
  public end_date!: Date;
  public element_id!: number;
  public journey_id!: number;
  public url!: string;
}

export const initializeExperiment = (
  sequelize: Sequelize,
): typeof Experiment => {
  Experiment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      element_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'elements', // This should match the table name of the Element model
          key: 'id',
        },
      },
      journey_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'journeys',
          key: 'id',
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Experiment',
      tableName: 'experiments',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Experiment;
};
