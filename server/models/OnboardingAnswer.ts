import { Model, DataTypes, Sequelize } from 'sequelize';

class OnboardingAnswer extends Model {
  public id!: number;
  public user_id!: number;
  public industry!: string;
  public company_size!: string;
  public discovery_method!: string;
  public monthly_traffic!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initializeOnboardingAnswer = (
  sequelize: Sequelize,
): typeof OnboardingAnswer => {
  OnboardingAnswer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_size: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discovery_method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      monthly_traffic: {
        type: DataTypes.STRING,
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
      modelName: 'OnboardingAnswer',
      tableName: 'onboarding_answers',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return OnboardingAnswer;
};
