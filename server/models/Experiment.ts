import { Model, DataTypes, Sequelize } from 'sequelize';

interface UrlRule {
  type: 'exact' | 'contains';
  url: string;
}

interface AdvancedUrlRules {
  include: UrlRule[];
  exclude: UrlRule[];
}

class Experiment extends Model {
  public id!: number;
  public name!: string;
  public start_date!: Date;
  public end_date!: Date;
  public order!: number;
  public element_id!: number;
  public page_id!: number;
  public project_id!: number;
  public url!: string;
  public started_at!: Date;
  public paused_at!: Date;
  public ended_at!: Date;
  public deleted_at!: Date;
  public scheduled_start_date!: Date;
  public scheduled_end_date!: Date;
  public allow_parallel!: boolean;
  public queue_after!: number;
  public advanced_url_rules!: AdvancedUrlRules | null;
  public editor_url!: string;
  public smart_trigger!: boolean | null;
  public type!: string;
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
      page_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'pages',
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
      paused_at: {
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
      scheduled_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scheduled_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      allow_parallel: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      queue_after: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      auto_finalize: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.ended_at) {
            return 'completed';
          } else if (this.started_at && !this.paused_at) {
            return 'running';
          } else if (this.paused_at) {
            return 'paused';
          } else {
            return 'pending';
          }
        },
      },
      advanced_url_rules: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          isValidStructure(value: AdvancedUrlRules | null) {
            if (value === null) return;

            if (!value.include || !Array.isArray(value.include)) {
              throw new Error('include must be an array');
            }
            if (!value.exclude || !Array.isArray(value.exclude)) {
              throw new Error('exclude must be an array');
            }
          },
        },
      },
      editor_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      smart_trigger: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
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
