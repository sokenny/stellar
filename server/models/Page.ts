import { Model, DataTypes, Sequelize } from 'sequelize';

class Page extends Model {
  public id!: number;
  public url!: string;
  public name!: string;
  public context!: object;
  public project_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initializePage = (sequelize: Sequelize): typeof Page => {
  Page.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      context: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
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
      modelName: 'Page',
      tableName: 'pages',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Page;
};
