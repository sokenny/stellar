import { Model, DataTypes, Sequelize } from 'sequelize';

class ExperimentTargetRule extends Model {
  public id!: number;
  public experiment_id!: number;
  public target_rule_id!: number;
}

export const initializeExperimentTargetRule = (
  sequelize: Sequelize,
): typeof ExperimentTargetRule => {
  ExperimentTargetRule.init(
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
      target_rule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'target_rules',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'ExperimentTargetRule',
      tableName: 'experiments_target_rules',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['experiment_id', 'target_rule_id'],
        },
      ],
    },
  );

  return ExperimentTargetRule;
};
