import { Model, DataTypes, Sequelize } from 'sequelize';

class AffiliateCode extends Model {
  public id!: number;
  public code!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initializeAffiliateCode = (
  sequelize: Sequelize,
): typeof AffiliateCode => {
  AffiliateCode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
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
      modelName: 'AffiliateCode',
      tableName: 'affiliate_codes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return AffiliateCode;
};
