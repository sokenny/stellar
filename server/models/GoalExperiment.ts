import { Model, DataTypes, Sequelize } from 'sequelize';

class GoalExperiment extends Model {
  public id!: number;
  public experiment_id!: number;
  public goal_id!: number;
  public is_main!: boolean;
  public created_at!: Date;
  public deleted_at?: Date;
}

export const initializeGoalExperiment = (
  sequelize: Sequelize,
): typeof GoalExperiment => {
  GoalExperiment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      experiment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'experiments',
          key: 'id',
        },
      },
      goal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'goals',
          key: 'id',
        },
      },
      is_main: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'GoalExperiment',
      tableName: 'goals_experiments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ['experiment_id', 'goal_id'],
          where: {
            deleted_at: null,
          },
        },
      ],
    },
  );

  return GoalExperiment;
};
