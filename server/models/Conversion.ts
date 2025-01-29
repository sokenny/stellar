import { Model, DataTypes, Sequelize } from 'sequelize';

class Conversion extends Model {
  public id!: number;
  public session_experiment_id!: number;
  public goal_id!: number;
  public converted_at!: Date;
  public created_at!: Date;
}

export const initializeConversion = (
  sequelize: Sequelize,
): typeof Conversion => {
  Conversion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      session_experiment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'session_experiments',
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
      converted_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Conversion',
      tableName: 'conversions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    },
  );

  return Conversion;
};
