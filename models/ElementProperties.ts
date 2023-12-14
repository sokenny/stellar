import { Model, DataTypes, Sequelize } from 'sequelize';

class ElementProperties extends Model {
  public id!: number;
  public inner_text!: string;
  public font_size!: string;
  public color!: string;
  public background_color!: string;
}

export const initializeElementProperties = (
  sequelize: Sequelize,
): typeof ElementProperties => {
  ElementProperties.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      inner_text: DataTypes.STRING,
      font_size: DataTypes.STRING,
      color: DataTypes.STRING,
      background_color: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'ElementProperties',
      tableName: 'element_properties',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return ElementProperties;
};
