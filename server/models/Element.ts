import { Model, DataTypes, Sequelize } from 'sequelize';

class Element extends Model {
  public id!: number;
  public type!: string;
  public selector!: string;
  public properties!: object;
}

export const initializeElement = (sequelize: Sequelize): typeof Element => {
  Element.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      selector: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      properties: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Element',
      tableName: 'elements',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Element;
};
