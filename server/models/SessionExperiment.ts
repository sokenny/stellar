import { Model, DataTypes, Sequelize } from 'sequelize';

class SessionExperiment extends Model {
  public id!: number;
  public session_id!: number;
  public experiment_id!: number;
  public variant_id!: number;
  public converted!: boolean;
  public experiment_mounted!: boolean;
  public had_issues?: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initializeSessionExperiment = (
  sequelize: Sequelize,
): typeof SessionExperiment => {
  SessionExperiment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id',
        },
      },
      experiment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'experiments',
          key: 'id',
        },
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'variants',
          key: 'id',
        },
      },
      converted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      experiment_mounted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      had_issues: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'SessionExperiment',
      tableName: 'session_experiments',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return SessionExperiment;
};
