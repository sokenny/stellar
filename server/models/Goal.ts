import GoalTypesEnum from '../helpers/enums/GoalTypesEnum';
import { Model, DataTypes, Sequelize } from 'sequelize';

class Goal extends Model {
  public id!: number;
  public experiment_id!: number;
  public type!: keyof typeof GoalTypesEnum;
  public selector!: string;
  public page_url!: string;
}

export const initializeGoal = (sequelize: Sequelize): typeof Goal => {
  Goal.init(
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
      type: {
        type: DataTypes.ENUM(...Object.values(GoalTypesEnum)),
        allowNull: false,
      },
      selector: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Goal',
      tableName: 'goals',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Goal;
};
