import { Model, DataTypes, Sequelize } from 'sequelize';

class Project extends Model {
  public id!: number;
  public name!: string;
  public domain!: string;
  public user_id!: number;
  public snippet_status!: number;
}

export const initializeProject = (sequelize: Sequelize): typeof Project => {
  Project.init(
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
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      snippet_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Project',
      tableName: 'projects',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Project;
};
