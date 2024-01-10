import GoalTypesEnum from '../helpers/enums/GoalTypesEnum';
import { Model, DataTypes, Sequelize } from 'sequelize';

class Goal extends Model {
  public id!: number;
  public experiment_id!: number;
  public type!: keyof typeof GoalTypesEnum;
  public selector!: string;
  public url_match_type?: 'contains' | 'exact' | 'regex';
  public url_match_value?: string;
  public element_url?: string;
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
      url_match_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      url_match_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      element_url: {
        type: DataTypes.TEXT,
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
