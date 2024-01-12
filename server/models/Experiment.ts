import { Model, DataTypes, Sequelize } from 'sequelize';

class Experiment extends Model {
  public id!: number;
  public name!: string;
  public start_date!: Date;
  public end_date!: Date;
  public order!: number;
  public element_id!: number;
  public journey_id!: number;
  public project_id!: number;
  public url!: string;
  public started_at!: Date;
  public ended_at!: Date;
  public deleted_at!: Date;
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
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
      project_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.ended_at) {
            return 'completed';
          } else if (this.started_at) {
            return 'running';
          } else if (this.journey_id) {
            return 'queued';
          } else {
            return 'pending';
          }
        },
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
