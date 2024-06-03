import { Model, DataTypes, Sequelize } from 'sequelize';

class ApiKey extends Model {
  public id!: number;
  public key!: string;
  public user_id!: number;
  public created_at!: Date;
  public expires_at!: Date;
}

export const initializeApiKey = (sequelize: Sequelize): typeof ApiKey => {
  ApiKey.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ApiKey',
      tableName: 'api_keys',
      createdAt: 'created_at',
      updatedAt: false,
      timestamps: true,
    },
  );

  return ApiKey;
};
