import { Model, DataTypes, Sequelize } from 'sequelize';

class TransactionalEmail extends Model {
  public id!: number;
  public user_id!: number;
  public campaign_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initializeTransactionalEmail = (
  sequelize: Sequelize,
): typeof TransactionalEmail => {
  TransactionalEmail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      campaign_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
      modelName: 'TransactionalEmail',
      tableName: 'transactional_emails',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return TransactionalEmail;
};
