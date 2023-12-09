// Variant.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db'; // Adjust the import path as necessary
import Element from './Element';
import Experiment from './Experiment';

class Variant extends Model {
    public id!: number;
    public elementId!: number; // Assuming 'Element' is a separate model
    public text?: string;
    public fontSize?: string;
    public color?: string;
    public backgroundColor?: string;
    public experimentId!: number; // Assuming 'Experiment' is a separate model
}

Variant.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    elementId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Elements', // This should match the table name of the Element model
            key: 'id',
        },
    },
    text: DataTypes.STRING,
    fontSize: DataTypes.STRING,
    color: DataTypes.STRING,
    backgroundColor: DataTypes.STRING,
    experimentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Experiments', // This should match the table name of the Experiment model
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Variant',
});

// Associations
Variant.belongsTo(Element, { foreignKey: 'elementId' });
Variant.belongsTo(Experiment, { foreignKey: 'experimentId' });

export default Variant;
