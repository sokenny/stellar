import { Model, DataTypes, Sequelize } from 'sequelize';

class Variant extends Model {
  public id!: number;
  public name!: string;
  public text?: string;
  public font_size?: string;
  public color?: string;
  public background_color?: string;
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
      text: DataTypes.STRING,
      font_size: DataTypes.STRING,
      color: DataTypes.STRING,
      background_color: DataTypes.STRING,
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
