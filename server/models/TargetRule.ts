import { Model, DataTypes, Sequelize } from 'sequelize';

interface RuleSettings {
  device: {
    enabled: boolean;
    include: string[];
  };
  country: {
    enabled: boolean;
    include: string[];
    exclude: string[];
  };
  url_params: {
    enabled: boolean;
    settings: Record<string, any>;
  };
}

class TargetRule extends Model {
  public id!: number;
  public project_id!: number;
  public rules!: RuleSettings;
}

export const initializeTargetRule = (
  sequelize: Sequelize,
): typeof TargetRule => {
  TargetRule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      rules: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          device: {
            enabled: false,
            include: [],
          },
          country: {
            enabled: false,
            include: [],
            exclude: [],
          },
          url_params: {
            enabled: false,
            settings: {},
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'TargetRule',
      tableName: 'target_rules',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return TargetRule;
};
