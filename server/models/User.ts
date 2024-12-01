import { Model, DataTypes, Sequelize } from 'sequelize';

class User extends Model {
  public id!: number;
  public email!: string;
  public first_name!: string;
  public last_name!: string;
  public password!: string;
  public last_active_at!: Date;
  public confirmation_token!: string;
  public confirmed_at!: Date;
  public created_at!: Date;
  public updated_at!: Date;
  public email_settings!: { recommendations: boolean; reminders: boolean };
  public affiliate_code!: string | null;
}

export const initializeUser = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      confirmation_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: { recommendations: true, reminders: true },
      },
      affiliate_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return User;
};
