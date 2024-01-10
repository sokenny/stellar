import { Model, DataTypes, Sequelize } from 'sequelize';

class Session extends Model {
  public id!: number;
  public session_id!: string;
  public length!: number;
  public click_count!: number;
  public scroll_depth!: number;
  public experiments_run!: any[];
  public visited_pages!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

export const initializeSession = (sequelize: Sequelize): typeof Session => {
  Session.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      length: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      click_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      scroll_depth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      experiments_run: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      visited_pages: {
        type: DataTypes.JSON,
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
      modelName: 'Session',
      tableName: 'sessions',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Session;
};
