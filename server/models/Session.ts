import { Model, DataTypes, Sequelize } from 'sequelize';

class Session extends Model {
  public id!: number;
  public visitor_id!: string;
  public length!: number;
  public click_count!: number;
  public scroll_depth!: number;
  public visited_pages!: string[];
  public ip!: string;
  public session_issues?: object;
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
      visitor_id: {
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
      visited_pages: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      session_issues: {
        type: DataTypes.JSONB,
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
