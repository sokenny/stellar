import { Model, DataTypes, Sequelize } from 'sequelize';

class Variant extends Model {
  public id!: number;
  public name!: string;
  public experiment_id!: number;
  public is_control?: boolean;
  public modifications?: any;
  public traffic: number;
  public deleted_at?: Date;
  public global_css?: string;
  public global_js?: string;
}

export const initializeVariant = (sequelize: Sequelize): typeof Variant => {
  Variant.init(
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
      experiment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'experiments',
          key: 'id',
        },
      },
      is_control: DataTypes.BOOLEAN,
      modifications: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      traffic: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 99,
        },
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      global_css: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      global_js: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Variant',
      tableName: 'variants',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Variant;
};
